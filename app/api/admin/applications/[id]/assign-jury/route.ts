import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(req, ["ADMIN"]);
    const { id } = await props.params;

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    const body = await req.json();
    const juryUserIds: string[] = body.juryUserIds || (body.juryUserId ? [body.juryUserId] : []);

    if (juryUserIds.length === 0) {
      return NextResponse.json({ error: "Укажите хотя бы одного члена жюри (juryUserId или juryUserIds)" }, { status: 400 });
    }

    // Verify all specified users have JURY role
    const juryUsers = await prisma.user.findMany({
      where: {
        id: { in: juryUserIds },
        role: "JURY",
      },
    });

    if (juryUsers.length === 0) {
      return NextResponse.json({ error: "Выбранные пользователи не являются экспертами жюри" }, { status: 400 });
    }

    // Assign evaluations
    let assignedCount = 0;
    for (const jury of juryUsers) {
      await prisma.evaluation.upsert({
        where: {
          applicationId_juryUserId: {
            applicationId: application.id,
            juryUserId: jury.id,
          },
        },
        create: {
          applicationId: application.id,
          juryUserId: jury.id,
          isDraft: true,
        },
        update: {},
      });
      assignedCount++;
    }

    // Advance application status to UNDER_REVIEW if paid/submitted
    if (["PAID", "SUBMITTED"].includes(application.status)) {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: "UNDER_REVIEW" },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "JURY_ASSIGNED",
        entityType: "Application",
        entityId: application.id,
        details: JSON.stringify({ juryUserIds: juryUsers.map((j) => j.id) }),
      },
    });

    return NextResponse.json({
      success: true,
      assignedCount,
      message: `Назначено экспертов жюри: ${assignedCount}`,
    });
  } catch (err: unknown) {
    const error = err as Error & { status?: number };
    console.error("Assign jury error:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка при назначении жюри" },
      { status: error.status || 500 }
    );
  }
}
