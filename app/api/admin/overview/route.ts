import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["ADMIN"]);

    // 1. User metrics
    const [totalUsers, participantsCount, teachersCount, juryCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "PARTICIPANT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "JURY" } }),
    ]);

    // 2. Application metrics
    const [
      totalApplications,
      draftCount,
      submittedCount,
      paidCount,
      underReviewCount,
      evaluatedCount,
      completedCount,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: "DRAFT" } }),
      prisma.application.count({ where: { status: "SUBMITTED" } }),
      prisma.application.count({ where: { status: "PAID" } }),
      prisma.application.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.application.count({ where: { status: "EVALUATED" } }),
      prisma.application.count({ where: { status: "COMPLETED" } }),
    ]);

    // 3. Financial metrics
    const confirmedPayments = await prisma.paymentTransaction.findMany({
      where: { status: "CONFIRMED" },
      select: { amount: true },
    });
    const totalRevenue = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);

    const commissionAccruals = await prisma.ledgerTransaction.findMany({
      where: { type: "COMMISSION_ACCRUAL", status: "CONFIRMED" },
      select: { amount: true },
    });
    const totalCommissions = commissionAccruals.reduce((sum, c) => sum + c.amount, 0);

    const pendingPayouts = await prisma.payoutRequest.findMany({
      where: { status: "REQUESTED" },
      select: { amount: true },
    });
    const pendingPayoutsAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      users: {
        total: totalUsers,
        participants: participantsCount,
        teachers: teachersCount,
        jury: juryCount,
      },
      applications: {
        total: totalApplications,
        draft: draftCount,
        submitted: submittedCount,
        paid: paidCount,
        underReview: underReviewCount,
        evaluated: evaluatedCount,
        completed: completedCount,
      },
      finance: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        pendingPayoutsCount: pendingPayouts.length,
        pendingPayoutsAmount: Math.round(pendingPayoutsAmount * 100) / 100,
      },
    });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка загрузки сводки администратора" },
      { status: error.status || 500 }
    );
  }
}
