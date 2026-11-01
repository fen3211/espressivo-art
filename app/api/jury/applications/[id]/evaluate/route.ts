import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
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
    const body = await req.json();
    const {
      scoreTechnique,
      scoreMusicality,
      scoreArtistry,
      scoreRepertoire,
      comment,
      isDraft,
      isFinalSubmit,
    } = body;

    const sTech = Math.round(Number(scoreTechnique) || 0);
    const sMus = Math.round(Number(scoreMusicality) || 0);
    const sArt = Math.round(Number(scoreArtistry) || 0);
    const sRep = Math.round(Number(scoreRepertoire) || 0);

    // Validate 4 criteria boundaries (0-25 each)
    if ([sTech, sMus, sArt, sRep].some((s) => s < 0 || s > 25)) {
      return NextResponse.json(
        { error: "Баллы по каждому критерию должны быть в диапазоне от 0 до 25", code: "INVALID_SCORES" },
        { status: 400 }
      );
    }

    const totalScore = sTech + sMus + sArt + sRep;
    const isFinal = isFinalSubmit !== undefined ? Boolean(isFinalSubmit) : isDraft === false;

    // Check if application exists
    const application = await prisma.application.findFirst({
      where: { OR: [{ id }, { code: id }] },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Заявка не найдена", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const applicationId = application.id;

    // Check assignment
    const existing = await prisma.evaluation.findUnique({
      where: {
        applicationId_juryUserId: {
          applicationId,
          juryUserId: session.userId,
        },
      },
    });

    if (!existing && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Доступ запрещен: заявка не назначена данному эксперту жюри", code: "NOT_ASSIGNED" },
        { status: 403 }
      );
    }

    // Immutable lock check
    if (existing && !existing.isDraft && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Оценка уже окончательно зафиксирована и заблокирована для изменений", code: "EVALUATION_LOCKED" },
        { status: 403 }
      );
    }

    // Upsert evaluation
    const evaluation = await prisma.evaluation.upsert({
      where: {
        applicationId_juryUserId: {
          applicationId,
          juryUserId: session.userId,
        },
      },
      create: {
        applicationId,
        juryUserId: session.userId,
        scoreTechnique: sTech,
        scoreMusicality: sMus,
        scoreArtistry: sArt,
        scoreRepertoire: sRep,
        totalScore,
        comment: comment ? String(comment).trim() : null,
        isDraft: !isFinal,
        submittedAt: isFinal ? new Date() : null,
      },
      update: {
        scoreTechnique: sTech,
        scoreMusicality: sMus,
        scoreArtistry: sArt,
        scoreRepertoire: sRep,
        totalScore,
        comment: comment ? String(comment).trim() : null,
        isDraft: !isFinal,
        submittedAt: isFinal ? new Date() : null,
      },
    });

    if (isFinal) {
      const allAppEvaluations = await prisma.evaluation.findMany({
        where: { applicationId },
      });

      const allCompleted = allAppEvaluations.every((e) => !e.isDraft);
      if (allCompleted && allAppEvaluations.length > 0) {
        await prisma.application.update({
          where: { id: applicationId },
          data: { status: "EVALUATED" },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "EVALUATION_FINALIZED",
          entityType: "Evaluation",
          entityId: evaluation.id,
          details: JSON.stringify({
            applicationId,
            totalScore,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      totalScore,
      isLocked: isFinal,
      message: isFinal ? "Оценка успешно зафиксирована" : "Черновик оценки сохранен",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("POST /api/jury/applications/[id]/evaluate error:", error);
    return NextResponse.json(
      { error: "Ошибка при сохранении оценки", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
