import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
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
        certificate: true,
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
        referralTeacher: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    // Role-based access and blind audition enforcement
    if (session.role === "JURY") {
      // Check if this jury member is assigned
      const isAssigned = application.evaluations.some((e) => e.juryUserId === session.userId);
      if (!isAssigned) {
        return NextResponse.json({ error: "Доступ к заявке запрещен (не назначена на оценку)" }, { status: 403 });
      }

      const juryEval = application.evaluations.find((e) => e.juryUserId === session.userId);

      // BLIND AUDITION: Minor PII is strictly stripped
      return NextResponse.json({
        id: application.id,
        applicationId: application.id,
        code: application.code,
        competitionTitle: application.competition.titleRu,
        nominationTitle: application.nomination.titleRu,
        ageCategoryTitle: application.ageCategory.titleRu,
        repertoire: application.repertoire,
        performanceDuration: application.performanceDuration,
        videoUrl: application.videoUrl,
        videoProvider: application.videoProvider,
        status: application.status,
        hasEvaluation: Boolean(juryEval && !juryEval.isDraft),
        evaluationDraft: juryEval
          ? {
              scoreTechnique: juryEval.scoreTechnique,
              scoreMusicality: juryEval.scoreMusicality,
              scoreArtistry: juryEval.scoreArtistry,
              scoreRepertoire: juryEval.scoreRepertoire,
              totalScore: juryEval.totalScore,
              comment: juryEval.comment,
              isDraft: juryEval.isDraft,
            }
          : null,
      });
    }

    // Check ownership for PARTICIPANT and TEACHER
    if (session.role === "PARTICIPANT" && application.userId !== session.userId) {
      return NextResponse.json({ error: "Доступ к чужой заявке запрещен" }, { status: 403 });
    }

    if (session.role === "TEACHER" && application.referralTeacher?.userId !== session.userId) {
      return NextResponse.json({ error: "Доступ к заявке запрещен" }, { status: 403 });
    }

    return NextResponse.json(application);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GET /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Ошибка при загрузке заявки" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { id } = await props.params;

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    // Only owner or admin can edit
    if (session.role !== "ADMIN" && existing.userId !== session.userId) {
      return NextResponse.json({ error: "Вы не можете редактировать эту заявку" }, { status: 403 });
    }

    // Participants can only edit DRAFT status
    if (session.role !== "ADMIN" && existing.status !== "DRAFT") {
      return NextResponse.json({ error: "Редактирование доступно только для черновиков" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.application.update({
      where: { id },
      data: {
        participantName: body.participantName ? String(body.participantName).trim() : existing.participantName,
        birthDate: body.birthDate ? new Date(body.birthDate) : existing.birthDate,
        teacherName: body.teacherName !== undefined ? body.teacherName : existing.teacherName,
        institution: body.institution !== undefined ? body.institution : existing.institution,
        repertoire: body.repertoire ? String(body.repertoire).trim() : existing.repertoire,
        performanceDuration: body.performanceDuration !== undefined ? Number(body.performanceDuration) : existing.performanceDuration,
        videoUrl: body.videoUrl ? String(body.videoUrl).trim() : existing.videoUrl,
        videoProvider: body.videoProvider || existing.videoProvider,
        parentFullName: body.parentFullName ? String(body.parentFullName).trim() : existing.parentFullName,
        parentEmail: body.parentEmail ? String(body.parentEmail).trim().toLowerCase() : existing.parentEmail,
        parentPhone: body.parentPhone ? String(body.parentPhone).trim() : existing.parentPhone,
        status: body.isSubmit ? "SUBMITTED" : existing.status,
      },
      include: {
        competition: true,
        nomination: true,
        ageCategory: true,
      },
    });

    return NextResponse.json({ application: updated, message: "Заявка успешно обновлена" });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("PUT /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Ошибка при обновлении заявки" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { id } = await props.params;

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && existing.userId !== session.userId) {
      return NextResponse.json({ error: "Вы не можете удалить эту заявку" }, { status: 403 });
    }

    if (session.role !== "ADMIN" && (existing.status !== "DRAFT" || existing.paymentStatus === "PAID")) {
      return NextResponse.json({ error: "Нельзя удалить отправленную или оплаченную заявку" }, { status: 400 });
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Заявка успешно удалена" });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("DELETE /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Ошибка при удалении заявки" }, { status: 500 });
  }
}
