import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await requireRole(req, ["ADMIN"]);

    const body = await req.json().catch(() => ({}));
    const { competitionId } = body;

    const where: Record<string, unknown> = {};
    if (competitionId) {
      where.competitionId = competitionId;
    }

    // Find applications that have evaluations
    const applications = await prisma.application.findMany({
      where: {
        ...where,
        evaluations: {
          some: { isDraft: false },
        },
      },
      include: {
        competition: true,
        nomination: true,
        evaluations: {
          where: { isDraft: false },
        },
        certificate: true,
      },
    });

    if (applications.length === 0) {
      return NextResponse.json({
        success: true,
        processedApplicationsCount: 0,
        certificatesIssuedCount: 0,
        message: "Нет заявок с завершенными оценками для подсчета результатов",
      });
    }

    const processedResults = [];

    for (const app of applications) {
      const sum = app.evaluations.reduce((acc, curr) => acc + curr.totalScore, 0);
      const avgScore = Math.round((sum / app.evaluations.length) * 10) / 10;

      // Distribution brackets
      let awardDegree = "PARTICIPANT";
      if (avgScore >= 98) {
        awardDegree = "GRAND_PRIX";
      } else if (avgScore >= 90) {
        awardDegree = "LAUREATE_1";
      } else if (avgScore >= 80) {
        awardDegree = "LAUREATE_2";
      } else if (avgScore >= 70) {
        awardDegree = "LAUREATE_3";
      } else if (avgScore >= 60) {
        awardDegree = "DIPLOMANT";
      }

      const certSuffix = awardDegree.replace(/_/g, "");
      const certificateNumber = `ESP-VOC-2026-${app.code.split("-").pop() || "0001"}-${certSuffix}`;
      const qrCodeToken = app.certificate?.qrCodeToken || crypto.randomBytes(16).toString("hex");

      const certificate = await prisma.certificate.upsert({
        where: { applicationId: app.id },
        create: {
          certificateNumber,
          applicationId: app.id,
          participantName: app.participantName,
          competitionTitle: app.competition.titleRu,
          nominationTitle: app.nomination.titleRu,
          awardDegree,
          totalScore: avgScore,
          qrCodeToken,
        },
        update: {
          awardDegree,
          totalScore: avgScore,
          certificateNumber,
        },
      });

      // Advance application to COMPLETED
      await prisma.application.update({
        where: { id: app.id },
        data: { status: "COMPLETED" },
      });

      processedResults.push({
        applicationCode: app.code,
        participantName: app.participantName,
        totalScore: avgScore,
        awardDegree,
        certificateNumber: certificate.certificateNumber,
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "RESULTS_CALCULATED",
        entityType: "Competition",
        entityId: competitionId || "ALL",
        details: JSON.stringify({ count: processedResults.length }),
      },
    });

    return NextResponse.json({
      success: true,
      processedApplicationsCount: applications.length,
      certificatesIssuedCount: processedResults.length,
      results: processedResults,
      message: `Результаты успешно рассчитаны. Выдано дипломов: ${processedResults.length}`,
    });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Calculate results error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка при автоматическом подсчете результатов" },
      { status: error.status || 500 }
    );
  }
}
