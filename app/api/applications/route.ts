import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { paymentGateway } from "@/lib/payment-gateway";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    let whereClause: Record<string, unknown> = {};

    if (session.role === "PARTICIPANT") {
      whereClause = { userId: session.userId };
    } else if (session.role === "TEACHER") {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!teacherProfile) {
        return NextResponse.json([]);
      }
      whereClause = { referralTeacherId: teacherProfile.id };
    } else if (session.role === "JURY") {
      // Blind audition projection for Jury
      const applications = await prisma.application.findMany({
        where: {
          evaluations: {
            some: { juryUserId: session.userId },
          },
        },
        include: {
          nomination: true,
          ageCategory: true,
          competition: true,
          evaluations: {
            where: { juryUserId: session.userId },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const juryApplications = applications.map((app) => {
        const evalRecord = app.evaluations[0];
        return {
          id: app.id,
          applicationId: app.id,
          code: app.code,
          competitionTitle: app.competition.titleRu,
          nominationTitle: app.nomination.titleRu,
          ageCategoryTitle: app.ageCategory.titleRu,
          repertoire: app.repertoire,
          performanceDuration: app.performanceDuration,
          videoUrl: app.videoUrl,
          videoProvider: app.videoProvider,
          status: app.status,
          hasEvaluation: Boolean(evalRecord && !evalRecord.isDraft),
          evaluationDraft: evalRecord
            ? {
                scoreTechnique: evalRecord.scoreTechnique,
                scoreMusicality: evalRecord.scoreMusicality,
                scoreArtistry: evalRecord.scoreArtistry,
                scoreRepertoire: evalRecord.scoreRepertoire,
                totalScore: evalRecord.totalScore,
                comment: evalRecord.comment,
                isDraft: evalRecord.isDraft,
              }
            : null,
        };
      });

      return NextResponse.json(juryApplications);
    } else if (session.role === "ADMIN") {
      whereClause = {};
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        competition: {
          select: {
            id: true,
            titleRu: true,
            titleEn: true,
            slug: true,
            entryFee: true,
            currency: true,
          },
        },
        nomination: {
          select: {
            id: true,
            code: true,
            titleRu: true,
            titleEn: true,
          },
        },
        ageCategory: {
          select: {
            id: true,
            code: true,
            titleRu: true,
            titleEn: true,
          },
        },
        certificate: {
          select: {
            id: true,
            certificateNumber: true,
            awardDegree: true,
            totalScore: true,
            qrCodeToken: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GET /api/applications error:", error);
    return NextResponse.json({ error: "Ошибка при получении списка заявок" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const body = await req.json();
    const {
      competitionId,
      nominationId,
      ageCategoryId,
      participantName,
      birthDate,
      teacherName,
      institution,
      repertoire,
      performanceDuration,
      videoUrl,
      videoProvider,
      parentFullName,
      parentEmail,
      parentPhone,
      consentDataProcess,
      consentPublicStream,
      referralCode,
      isSubmit,
    } = body;

    // Legal & minor consent check: 152-FZ / GDPR data processing is strictly required
    if (!consentDataProcess) {
      return NextResponse.json(
        { error: "Требуется согласие родителя/законного представителя на обработку персональных данных (152-ФЗ / GDPR)" },
        { status: 400 }
      );
    }

    // Required fields validation
    if (!competitionId || !nominationId || !ageCategoryId) {
      return NextResponse.json({ error: "Выберите конкурс, номинацию и возрастную категорию" }, { status: 400 });
    }
    if (!participantName || !birthDate || !repertoire || !videoUrl) {
      return NextResponse.json({ error: "Заполните обязательные поля участника, репертуара и видеозаписи" }, { status: 400 });
    }
    if (!parentFullName || !parentEmail || !parentPhone) {
      return NextResponse.json({ error: "Укажите контактные данные законного представителя" }, { status: 400 });
    }

    // Verify foreign keys exist and belong to the specified competition
    const competition = await prisma.competition.findUnique({ where: { id: competitionId } });
    if (!competition) {
      return NextResponse.json({ error: "Конкурс не найден" }, { status: 404 });
    }

    const nomination = await prisma.nomination.findUnique({ where: { id: nominationId } });
    if (!nomination) {
      return NextResponse.json({ error: "Номинация не найдена" }, { status: 404 });
    }
    if (nomination.competitionId !== competitionId) {
      return NextResponse.json(
        { error: "Выбранная номинация не принадлежит указанному конкурсу", code: "INVALID_NOMINATION" },
        { status: 400 }
      );
    }

    const ageCategory = await prisma.ageCategory.findUnique({ where: { id: ageCategoryId } });
    if (!ageCategory) {
      return NextResponse.json({ error: "Возрастная категория не найдена" }, { status: 404 });
    }
    if (ageCategory.competitionId !== competitionId) {
      return NextResponse.json(
        { error: "Выбранная возрастная категория не принадлежит указанному конкурсу", code: "INVALID_AGE_CATEGORY" },
        { status: 400 }
      );
    }

    // Validate participant age on competition date (2026)
    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      return NextResponse.json({ error: "Указана некорректная дата рождения участника" }, { status: 400 });
    }

    const compRefDate = competition.startDate ? new Date(competition.startDate) : new Date("2026-02-01T00:00:00Z");
    let participantAge = compRefDate.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = compRefDate.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && compRefDate.getDate() < birthDateObj.getDate())) {
      participantAge--;
    }

    if (participantAge < ageCategory.minAge || participantAge > ageCategory.maxAge) {
      return NextResponse.json(
        {
          error: `INVALID_AGE_FOR_CATEGORY: Возраст участника (${participantAge} лет на дату проведения конкурса) не соответствует категории "${ageCategory.titleRu}" (${ageCategory.minAge}–${ageCategory.maxAge} лет)`,
          code: "INVALID_AGE_FOR_CATEGORY",
          calculatedAge: participantAge,
          minAge: ageCategory.minAge,
          maxAge: ageCategory.maxAge,
        },
        { status: 400 }
      );
    }

    // Check referral teacher
    let referralTeacherId: string | null = null;
    if (referralCode) {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { referralCode: String(referralCode).trim() },
      });
      if (teacher) {
        referralTeacherId = teacher.id;
      }
    }

    // Generate unique application code dynamically from competition year
    const compYear = (competition.startDate ? new Date(competition.startDate) : new Date()).getFullYear();
    let code = "";
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      code = `EXP-${compYear}-${randomNum}`;
      const existing = await prisma.application.findUnique({ where: { code } });
      if (!existing) isUnique = true;
    }

    const initialStatus = isSubmit ? "SUBMITTED" : "DRAFT";

    const application = await prisma.application.create({
      data: {
        code,
        userId: session.userId,
        competitionId,
        nominationId,
        ageCategoryId,
        participantName: String(participantName).trim(),
        birthDate: new Date(birthDate),
        teacherName: teacherName ? String(teacherName).trim() : null,
        institution: institution ? String(institution).trim() : null,
        repertoire: String(repertoire).trim(),
        performanceDuration: performanceDuration ? Number(performanceDuration) : null,
        videoUrl: String(videoUrl).trim(),
        videoProvider: videoProvider || "YOUTUBE",
        parentFullName: String(parentFullName).trim(),
        parentEmail: String(parentEmail).trim().toLowerCase(),
        parentPhone: String(parentPhone).trim(),
        consentDataProcess: Boolean(consentDataProcess),
        consentPublicStream: Boolean(consentPublicStream),
        status: initialStatus,
        paymentStatus: "UNPAID",
        referralTeacherId,
      },
      include: {
        competition: true,
        nomination: true,
        ageCategory: true,
      },
    });

    let paymentUrl: string | undefined = undefined;

    // If submitted, automatically initiate payment session
    if (isSubmit) {
      const paymentResult = await paymentGateway.createPaymentSession({
        applicationId: application.id,
        amount: competition.entryFee,
        userId: session.userId,
        currency: competition.currency,
        description: `Организационный взнос за участие в конкурсе ${competition.titleRu} (${application.code})`,
      });
      paymentUrl = paymentResult.paymentUrl;
    }

    return NextResponse.json(
      {
        application,
        paymentUrl,
        message: isSubmit ? "Заявка отправлена на модерацию и оплату" : "Черновик заявки сохранен",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("POST /api/applications error:", error);
    return NextResponse.json({ error: "Ошибка при сохранении заявки" }, { status: 500 });
  }
}
