import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["ADMIN"]);

    const payouts = await prisma.payoutRequest.findMany({
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = payouts.map((p) => ({
      id: p.id,
      requestId: `REQ-${p.id.slice(0, 8).toUpperCase()}`,
      teacherName: p.teacher.user.fullName,
      teacherEmail: p.teacher.user.email,
      organization: p.teacher.organization || "Независимый педагог",
      amount: `${p.amount.toLocaleString("ru-RU")} ₽`,
      amountRaw: p.amount,
      bankDetails: p.bankDetails,
      status: p.status === "COMPLETED" ? "APPROVED" : p.status,
      date: p.createdAt.toLocaleDateString("ru-RU"),
    }));

    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Admin payouts GET error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка загрузки списка заявок на выплату" },
      { status: error.status || 500 }
    );
  }
}
