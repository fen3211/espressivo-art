import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken, setAuthCookie } from "@/lib/auth";
import { authRateLimiter } from "@/lib/rate-limiter";

const DEMO_EMAILS = [
  "participant@espressivo.art",
  "teacher@espressivo.art",
  "jury@espressivo.art",
  "admin@espressivo.art",
];

// Pre-computed bcrypt cost-10 hash for constant-time comparison on nonexistent/blocked users
// Prevents side-channel response timing attacks for user enumeration (ASVS 2.1.8, 2.1.9)
const DUMMY_BCRYPT_HASH = "$2a$10$wT8KzQh5XvG8Z5B1vC3zU.uV2X5Z8B1vC3zU.uV2X5Z8B1vC3zU.";

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
    const rateLimitKey = authRateLimiter.getClientIdentifier(req, normalizedEmail);

    // 1. Rate limiting & brute force check (with anti-spoofing and fail-closed security)
    const rateCheck = await authRateLimiter.check(rateLimitKey);
    if (rateCheck.isBlocked) {
      const status = rateCheck.failClosed ? 503 : 429;
      const code = rateCheck.failClosed ? "SERVICE_UNAVAILABLE" : "RATE_LIMITED";
      const errorMessage = rateCheck.failClosed
        ? "Служба авторизации временно недоступна. Пожалуйста, повторите попытку позже."
        : `Слишком много неудачных попыток входа. Пожалуйста, повторите через ${rateCheck.retryAfterSeconds} сек.`;

      return NextResponse.json(
        {
          error: errorMessage,
          code,
          retryAfter: rateCheck.retryAfterSeconds,
        },
        { status }
      );
    }

    // 2. Strict Production Guard: Demo accounts are unconditionally forbidden in NODE_ENV=production.
    // No environment variable (such as ENABLE_DEMO_ACCOUNTS) can override or bypass this invariant.
    // To prevent user enumeration and timing side-channels, we do NOT return a distinct error code
    // (such as DEMO_ACCOUNTS_DISABLED or 403) or return immediately.
    const isDemoInProd =
      process.env.NODE_ENV === "production" && DEMO_EMAILS.includes(normalizedEmail);

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        teacherProfile: true,
      },
    });

    if (isDemoInProd || !user || !user.isActive) {
      // Execute constant-time bcrypt verification to prevent timing leaks
      await verifyPassword(String(password), DUMMY_BCRYPT_HASH);
      await authRateLimiter.recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: "Неверный логин или пароль", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(String(password), user.passwordHash);
    if (!isMatch) {
      await authRateLimiter.recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: "Неверный логин или пароль", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Successful login: clear rate limit tracker
    await authRateLimiter.clear(rateLimitKey);

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

