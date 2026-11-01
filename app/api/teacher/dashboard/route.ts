import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Доступ разрешен только для преподавателей" }, { status: 403 });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId: session.userId },
      include: {
        referredApps: {
          include: {
            competition: true,
            ledgerEntries: true,
          },
          orderBy: { createdAt: "desc" },
        },
        ledgerEntries: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Профиль преподавателя не найден" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://espressivo.art";
    const referralLink = `${appUrl}/ref/${teacher.referralCode}`;

    // Total earned from commission accruals
    const accruals = await prisma.ledgerTransaction.findMany({
      where: {
        teacherId: teacher.id,
        type: "COMMISSION_ACCRUAL",
        status: "CONFIRMED",
      },
      select: { amount: true },
    });
    const totalEarned = accruals.reduce((acc, curr) => acc + curr.amount, 0);

    const paidApps = teacher.referredApps.filter((app) => app.paymentStatus === "PAID");

    const participants = teacher.referredApps.map((app) => {
      const commissionLedger = app.ledgerEntries.find((l) => l.type === "COMMISSION_ACCRUAL");
      const commissionAmount = commissionLedger ? commissionLedger.amount : Math.round(app.competition.entryFee * teacher.commissionRate * 100) / 100;

      return {
        id: app.id,
        participantName: app.participantName,
        applicationCode: app.code,
        competitionTitle: app.competition.titleRu,
        entryFee: app.competition.entryFee,
        commissionAmount,
        paymentDate: app.updatedAt.toISOString(),
        status: app.paymentStatus === "PAID" ? "Оплачено" : "Ожидает оплаты",
      };
    });

    return NextResponse.json({
      referralCode: teacher.referralCode,
      referralLink,
      commissionRate: teacher.commissionRate,
      balance: teacher.balance,
      totalEarned: Math.round(totalEarned * 100) / 100,
      paidApplicationsCount: paidApps.length,
      participants,
      recentTransactions: teacher.ledgerEntries.map((entry) => ({
        id: entry.id,
        type: entry.type,
        amount: entry.amount,
        description: entry.description,
        createdAt: entry.createdAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Teacher dashboard error:", error);
    return NextResponse.json({ error: "Ошибка загрузки кабинета преподавателя" }, { status: 500 });
  }
}
