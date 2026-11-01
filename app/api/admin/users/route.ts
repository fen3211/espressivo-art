import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["ADMIN"]);

    const users = await prisma.user.findMany({
      include: {
        teacherProfile: true,
        _count: {
          select: {
            applications: true,
            evaluations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      phone: u.phone,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
      teacherProfile: u.teacherProfile
        ? {
            referralCode: u.teacherProfile.referralCode,
            balance: u.teacherProfile.balance,
            organization: u.teacherProfile.organization,
          }
        : null,
      applicationsCount: u._count.applications,
      evaluationsCount: u._count.evaluations,
    }));

    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка загрузки списка пользователей" },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await requireRole(req, ["ADMIN"]);

    const body = await req.json();
    const { userId, role, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: "Не указан userId" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role ? { role } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        isActive: updated.isActive,
      },
      message: "Пользователь успешно обновлен",
    });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Admin users PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка при обновлении пользователя" },
      { status: error.status || 500 }
    );
  }
}
