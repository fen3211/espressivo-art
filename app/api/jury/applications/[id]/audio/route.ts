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
      return NextResponse.json(
        { error: "Требуется авторизация", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    if (session.role !== "JURY" && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Доступ к аудиопотоку разрешен только экспертам жюри и администраторам", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const { id } = await props.params;

    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id }, { code: id }],
      },
      include: {
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

    // Verify assignment for Jury
    if (session.role !== "ADMIN" && application.evaluations.length === 0) {
      return NextResponse.json(
        { error: "Доступ запрещен: заявка не назначена данному эксперту жюри", code: "NOT_ASSIGNED" },
        { status: 403 }
      );
    }

    // Return sanitized audio-only representation (precludes raw video stream inspection)
    return NextResponse.json({
      applicationId: application.id,
      code: application.code,
      mediaType: "AUDIO_ONLY",
      streamUrl: `/api/jury/applications/${application.id}/audio/stream`,
      repertoire: application.repertoire,
      performanceDuration: application.performanceDuration,
      isBlindModeEnforced: true,
      provider: application.videoProvider,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GET /api/jury/applications/[id]/audio error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении аудиопотока заявки", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
