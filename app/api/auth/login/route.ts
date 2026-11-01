import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Укажите email и пароль" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        teacherProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    const isMatch = await verifyPassword(String(password), user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

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
    return NextResponse.json({ error: "Внутренняя ошибка сервера при входе" }, { status: 500 });
  }
}
