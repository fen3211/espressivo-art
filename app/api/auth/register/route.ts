import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName, role, phone, referralCode, organization } = body;

    // Validate required fields
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Некорректный email адрес" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Пароль должен содержать не менее 6 символов" }, { status: 400 });
    }
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json({ error: "Укажите полное имя" }, { status: 400 });
    }
    const userRole = role === "TEACHER" ? "TEACHER" : "PARTICIPANT";

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Пользователь с таким email уже зарегистрирован" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    let generatedReferralCode: string | undefined = undefined;

    // Create user and profile
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: fullName.trim(),
          role: userRole,
          phone: phone ? String(phone).trim() : null,
        },
      });

      if (userRole === "TEACHER") {
        // Auto-generate unique teacher referral code
        const safeName = fullName.replace(/[^a-zA-Zа-яА-Я0-9]/g, "").slice(0, 5).toUpperCase() || "VOCAL";
        generatedReferralCode = `TEACHER-${safeName}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        await tx.teacherProfile.create({
          data: {
            userId: newUser.id,
            referralCode: generatedReferralCode,
            organization: organization ? String(organization).trim() : null,
            commissionRate: 0.20,
            balance: 0.0,
          },
        });
      }

      // If registered participant with a referral code, log attribution audit
      if (userRole === "PARTICIPANT" && referralCode) {
        const referredBy = await tx.teacherProfile.findUnique({
          where: { referralCode: String(referralCode).trim() },
        });

        if (referredBy) {
          await tx.auditLog.create({
            data: {
              userId: newUser.id,
              action: "PARTICIPANT_REGISTERED_WITH_REFERRAL",
              entityType: "User",
              entityId: newUser.id,
              details: JSON.stringify({ referralCode, teacherId: referredBy.id }),
            },
          });
        }
      }

      return newUser;
    });

    // Create session token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          referralCode: generatedReferralCode,
        },
        message: "Регистрация успешно завершена",
      },
      { status: 201 }
    );

    return setAuthCookie(response, token);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Register error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера при регистрации" }, { status: 500 });
  }
}
