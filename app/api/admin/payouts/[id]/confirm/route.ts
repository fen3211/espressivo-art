import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(req, ["ADMIN"]);
    const { id } = await props.params;

    const payout = await prisma.payoutRequest.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payout) {
      return NextResponse.json({ error: "Запрос на вывод средств не найден" }, { status: 404 });
    }

    if (payout.status === "COMPLETED") {
      return NextResponse.json({ error: "Данная выплата уже подтверждена и обработана" }, { status: 400 });
    }

    const updatedPayout = await prisma.$transaction(async (tx) => {
      // 1. Update payout request status
      const completed = await tx.payoutRequest.update({
        where: { id },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
        },
      });

      // 2. Confirm pending ledger transaction
      const ledgerEntry = await tx.ledgerTransaction.findFirst({
        where: {
          teacherId: payout.teacherId,
          type: "PAYOUT",
          status: "PENDING",
        },
        orderBy: { createdAt: "desc" },
      });

      if (ledgerEntry) {
        await tx.ledgerTransaction.update({
          where: { id: ledgerEntry.id },
          data: { status: "CONFIRMED" },
        });
      }

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "PAYOUT_CONFIRMED",
          entityType: "PayoutRequest",
          entityId: payout.id,
          details: JSON.stringify({
            teacherEmail: payout.teacher.user.email,
            amount: payout.amount,
          }),
        },
      });

      return completed;
    });

    return NextResponse.json({
      success: true,
      payoutRequest: updatedPayout,
      message: `Выплата #${id.substring(0, 8)} на сумму ${payout.amount} ₽ успешно подтверждена`,
    });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Confirm payout error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка при подтверждении выплаты" },
      { status: error.status || 500 }
    );
  }
}
