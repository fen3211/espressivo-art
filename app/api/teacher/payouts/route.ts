import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Профиль преподавателя не найден" }, { status: 404 });
    }

    const payouts = await prisma.payoutRequest.findMany({
      where: { teacherId: teacher.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payouts);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GET /api/teacher/payouts error:", error);
    return NextResponse.json({ error: "Ошибка при получении истории выплат" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Доступ разрешен только преподавателям" }, { status: 403 });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Профиль преподавателя не найден" }, { status: 404 });
    }

    const body = await req.json();
    const { amount, bankDetails } = body;

    const payoutAmount = Number(amount);
    if (!payoutAmount || isNaN(payoutAmount) || payoutAmount <= 0) {
      return NextResponse.json({ error: "Укажите корректную сумму вывода" }, { status: 400 });
    }

    if (payoutAmount < 1000) {
      return NextResponse.json({ error: "Минимальная сумма вывода составляет 1 000 ₽" }, { status: 400 });
    }

    if (payoutAmount > teacher.balance) {
      return NextResponse.json(
        { error: `Недостаточно средств. Доступно для вывода: ${teacher.balance.toLocaleString("ru-RU")} ₽` },
        { status: 400 }
      );
    }

    if (!bankDetails || typeof bankDetails !== "string" || bankDetails.trim().length < 5) {
      return NextResponse.json({ error: "Укажите полные реквизиты для выплаты (ИНН, БИК, номер счета или СБП)" }, { status: 400 });
    }

    // Atomic transaction for payout request & balance deduction
    const payoutRequest = await prisma.$transaction(async (tx) => {
      // Re-read current balance inside transaction to prevent concurrent race condition overdrafts
      const currentTeacher = await tx.teacherProfile.findUnique({
        where: { id: teacher.id },
      });

      if (!currentTeacher || currentTeacher.balance < payoutAmount) {
        throw new Error("Недостаточно средств на балансе для совершения выплаты");
      }

      // Deduct balance
      await tx.teacherProfile.update({
        where: { id: teacher.id },
        data: {
          balance: {
            decrement: payoutAmount,
          },
        },
      });

      // Create payout record
      const payout = await tx.payoutRequest.create({
        data: {
          teacherId: teacher.id,
          amount: payoutAmount,
          bankDetails: bankDetails.trim(),
          status: "REQUESTED",
        },
      });

      // Record negative movement in financial ledger
      await tx.ledgerTransaction.create({
        data: {
          teacherId: teacher.id,
          type: "PAYOUT",
          amount: -payoutAmount,
          status: "PENDING",
          description: `Запрос на вывод средств #${payout.id.substring(0, 8)}`,
        },
      });

      return payout;
    });

    return NextResponse.json({ payoutRequest, message: "Запрос на вывод средств успешно создан" }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("POST /api/teacher/payouts error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка при оформлении заявки на вывод" },
      { status: 400 }
    );
  }
}
