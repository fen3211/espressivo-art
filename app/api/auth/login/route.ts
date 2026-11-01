import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken, setAuthCookie } from "@/lib/auth";

const DEMO_EMAILS = [
  "participant@espressivo.art",
  "teacher@espressivo.art",
  "jury@espressivo.art",
  "admin@espressivo.art",
];

// In-memory rate limiting tracker (per normalized email and/or client IP)
interface RateLimitEntry {
  attempts: number;
  blockedUntil: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function getClientIdentifier(req: Request, email: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${ip}:${email}`;
}

function checkRateLimit(key: string): { isBlocked: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry) return { isBlocked: false };

  if (entry.blockedUntil > now) {
    return {
      isBlocked: true,
      retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // If previous block expired, reset
  if (entry.blockedUntil > 0 && entry.blockedUntil <= now) {
    rateLimitMap.delete(key);
  }
  return { isBlocked: false };
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { attempts: 0, blockedUntil: 0 };
  entry.attempts += 1;

  // Max 5 failed attempts per 10 minutes
  if (entry.attempts >= 5) {
    entry.blockedUntil = now + 15 * 60 * 1000; // block for 15 minutes
  }
  rateLimitMap.set(key, entry);
}

function clearRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Укажите email и пароль", code: "CREDENTIALS_REQUIRED" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const rateLimitKey = getClientIdentifier(req, normalizedEmail);

    // 1. Rate limiting & brute force check
    const rateCheck = checkRateLimit(rateLimitKey);
    if (rateCheck.isBlocked) {
      return NextResponse.json(
        {
          error: `Слишком много неудачных попыток входа. Пожалуйста, повторите через ${rateCheck.retryAfterSeconds} сек.`,
          code: "RATE_LIMITED",
          retryAfter: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Strict Production Guard: Disable demo accounts in production
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ENABLE_DEMO_ACCOUNTS !== "true" &&
      DEMO_EMAILS.includes(normalizedEmail)
    ) {
      return NextResponse.json(
        {
          error: "Вход через демонстрационные аккаунты заблокирован в рабочей среде.",
          code: "DEMO_ACCOUNTS_DISABLED",
        },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        teacherProfile: true,
      },
    });

    if (!user || !user.isActive) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: "Неверный логин или пароль", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(String(password), user.passwordHash);
    if (!isMatch) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: "Неверный логин или пароль", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Successful login: clear rate limit tracker
    clearRateLimit(rateLimitKey);

    // Role-based redirect URL
    let redirectUrl = "/dashboard";
    if (user.role === "ADMIN") {
      redirectUrl = "/admin";
    } else if (user.role === "JURY") {
      redirectUrl = "/jury/dashboard";
    } else if (user.role === "TEACHER") {
      redirectUrl = "/teacher";
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        referralCode: user.teacherProfile?.referralCode,
      },
      redirectUrl,
    });

    return setAuthCookie(response, token);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера при входе", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
