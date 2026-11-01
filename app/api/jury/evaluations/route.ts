import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || (session.role !== "JURY" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Доступ разрешен только членам жюри" }, { status: 403 });
    }

    const body = await req.json();
    const {
      applicationId,
      scoreTechnique,
      scoreMusicality,
      scoreArtistry,
      scoreRepertoire,
      comment,
      isFinalSubmit,
    } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "Не указан идентификатор заявки" }, { status: 400 });
    }

    const sTech = Math.round(Number(scoreTechnique) || 0);
    const sMus = Math.round(Number(scoreMusicality) || 0);
    const sArt = Math.round(Number(scoreArtistry) || 0);
    const sRep = Math.round(Number(scoreRepertoire) || 0);

    // Validate 4 criteria boundaries (0-25 each)
    if ([sTech, sMus, sArt, sRep].some((s) => s < 0 || s > 25)) {
      return NextResponse.json(
        { error: "Баллы по каждому критерию должны быть в диапазоне от 0 до 25" },
        { status: 400 }
      );
    }

    const totalScore = sTech + sMus + sArt + sRep;

    // Find existing evaluation assignment
    const existing = await prisma.evaluation.findUnique({
      where: {
        applicationId_juryUserId: {
          applicationId,
          juryUserId: session.userId,
        },
      },
    });

    // Verify assignment: Jury member must have an assigned evaluation task
    if (!existing && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Доступ запрещен: заявка не назначена данному эксперту жюри" },
        { status: 403 }
      );
    }

    // Immutable lock check
    if (existing && !existing.isDraft && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Оценка уже окончательно зафиксирована и заблокирована для изменений" },
        { status: 403 }
      );
    }

    // Save or update evaluation
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
        isDraft: !Boolean(isFinalSubmit),
        submittedAt: isFinalSubmit ? new Date() : null,
      },
      update: {
        scoreTechnique: sTech,
        scoreMusicality: sMus,
        scoreArtistry: sArt,
        scoreRepertoire: sRep,
        totalScore,
        comment: comment ? String(comment).trim() : null,
        isDraft: !Boolean(isFinalSubmit),
        submittedAt: isFinalSubmit ? new Date() : null,
      },
    });

    // If final submission, check if all assigned jury evaluations are completed
    if (isFinalSubmit) {
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

      // Audit log
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
      isLocked: Boolean(isFinalSubmit),
      message: isFinalSubmit ? "Оценка успешно зафиксирована" : "Черновик оценки сохранен",
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("POST /api/jury/evaluations error:", error);
    return NextResponse.json({ error: "Ошибка при сохранении оценки" }, { status: 500 });
  }
}
