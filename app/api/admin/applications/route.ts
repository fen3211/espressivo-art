import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["ADMIN"]);

    const url = new URL(req.url);
    const competitionId = url.searchParams.get("competitionId");
    const status = url.searchParams.get("status");
    const paymentStatus = url.searchParams.get("paymentStatus");

    const where: Record<string, unknown> = {};
    if (competitionId) where.competitionId = competitionId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const applications = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
          },
        },
        competition: {
          select: {
            id: true,
            titleRu: true,
            titleEn: true,
            entryFee: true,
          },
        },
        nomination: {
          select: {
            id: true,
            code: true,
            titleRu: true,
          },
        },
        ageCategory: {
          select: {
            id: true,
            code: true,
            titleRu: true,
          },
        },
        evaluations: {
          include: {
            juryUser: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        certificate: true,
        referralTeacher: {
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

    return NextResponse.json(applications);
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Admin applications GET error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка при получении реестра заявок" },
      { status: error.status || 500 }
    );
  }
}
