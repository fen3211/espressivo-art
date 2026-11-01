import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session || (session.role !== "JURY" && session.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Доступ разрешен только членам жюри", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const { id } = await props.params;

    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
      include: {
        competition: true,
        nomination: true,
        ageCategory: true,
        evaluations: {
          where: session.role === "ADMIN" ? {} : { juryUserId: session.userId },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Конкурсная заявка не найдена", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Check assignment for Jury
    const evalRecord = application.evaluations[0];
    if (session.role !== "ADMIN" && !evalRecord) {
      return NextResponse.json(
        { error: "Доступ запрещен: заявка не назначена данному эксперту жюри", code: "NOT_ASSIGNED" },
        { status: 403 }
      );
    }

    const isJury = session.role === "JURY";
    const audioUrl = `/api/jury/applications/${application.id}/audio`;

    // BLIND AUDITION SERVER-SIDE ENFORCEMENT:
    // 1. Strict minimization of minor and guardian PII (names, birth dates, contacts excluded).
    // 2. Server MUST NOT return raw video URL to Jury when blind mode is active.
    // 3. Jury cannot bypass blind audition mode under any circumstances.
    // 4. Admin retains authorized full video view capability.
    return NextResponse.json({
      id: application.id,
      applicationId: application.id,
      code: application.code,
      competitionTitleRu: application.competition.titleRu,
      competitionTitleEn: application.competition.titleEn,
      nominationTitleRu: application.nomination.titleRu,
      nominationTitleEn: application.nomination.titleEn,
      ageCategoryTitleRu: application.ageCategory.titleRu,
      ageCategoryTitleEn: application.ageCategory.titleEn,
      repertoire: application.repertoire,
      performanceDuration: application.performanceDuration,
      videoUrl: isJury ? null : application.videoUrl,
      audioUrl: isJury ? audioUrl : null,
      audioRepresentation: isJury
        ? {
            type: "AUDIO_ONLY",
            streamUrl: audioUrl,
            provider: application.videoProvider,
            isBlindMode: true,
          }
        : null,
      videoProvider: application.videoProvider,
      status: application.status,
      isBlindModeDefault: true,
      isBlindModeEnforced: isJury,
      hasEvaluation: Boolean(evalRecord && !evalRecord.isDraft),
      evaluationDraft: evalRecord
        ? {
            scoreTechnique: evalRecord.scoreTechnique,
            scoreMusicality: evalRecord.scoreMusicality,
            scoreArtistry: evalRecord.scoreArtistry,
            scoreRepertoire: evalRecord.scoreRepertoire,
            totalScore: evalRecord.totalScore,
            comment: evalRecord.comment || "",
            isDraft: evalRecord.isDraft,
            isLocked: !evalRecord.isDraft,
          }
        : null,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GET /api/jury/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении данных заявки для жюри", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
