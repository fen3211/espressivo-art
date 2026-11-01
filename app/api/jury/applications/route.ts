import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || (session.role !== "JURY" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Доступ разрешен только членам жюри" }, { status: 403 });
    }

    const evaluations = await prisma.evaluation.findMany({
      where: {
        juryUserId: session.userId,
      },
      include: {
        application: {
          include: {
            competition: true,
            nomination: true,
            ageCategory: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const isJury = session.role === "JURY";

    // BLIND AUDITION: Strip all minor and teacher PII and enforce raw video stripping for Jury
    const results = evaluations.map((ev) => {
      const app = ev.application;
      const audioUrl = `/api/jury/applications/${app.id}/audio`;
      return {
        applicationId: app.id,
        code: app.code,
        nominationTitle: app.nomination.titleRu,
        ageCategoryTitle: app.ageCategory.titleRu,
        repertoire: app.repertoire,
        videoUrl: isJury ? null : app.videoUrl,
        audioUrl: isJury ? audioUrl : null,
        isBlindModeEnforced: isJury,
        hasEvaluation: !ev.isDraft,
        evaluationDraft: {
          scoreTechnique: ev.scoreTechnique,
          scoreMusicality: ev.scoreMusicality,
          scoreArtistry: ev.scoreArtistry,
          scoreRepertoire: ev.scoreRepertoire,
          totalScore: ev.totalScore,
          comment: ev.comment || "",
          isDraft: ev.isDraft,
        },
      };
    });

    return NextResponse.json(results);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GET /api/jury/applications error:", error);
    return NextResponse.json({ error: "Ошибка при получении списка заявок для жюри" }, { status: 500 });
  }
}
