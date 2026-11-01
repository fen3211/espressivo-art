const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "true") {
    console.error("CRITICAL ERROR: Seeding demo accounts (participant@espressivo.art, etc.) with default passwords is strictly prohibited in PRODUCTION environments.");
    process.exit(1);
  }

  console.log("Starting espressivo ART database seeding (Development/Staging mode)...");

  // 1. Clear existing data in reverse foreign-key order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.ledgerTransaction.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.application.deleteMany();
  await prisma.nomination.deleteMany();
  await prisma.ageCategory.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleared.");

  // 2. Hash common test password "pass1234"
  const passwordHash = await bcrypt.hash("pass1234", 10);

  // 3. Create 4 Test Users
  // Participant
  const participantUser = await prisma.user.create({
    data: {
      email: "participant@espressivo.art",
      passwordHash,
      role: "PARTICIPANT",
      fullName: "Алиса Морозова (Мама: Елена Морозова)",
      phone: "+7 (999) 111-22-33",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300",
    },
  });

  // Teacher with profile & referral code
  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@espressivo.art",
      passwordHash,
      role: "TEACHER",
      fullName: "Мария Александровна Смирнова",
      phone: "+7 (999) 222-33-44",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300",
    },
  });

  const teacherProfile = await prisma.teacherProfile.create({
    data: {
      userId: teacherUser.id,
      referralCode: "TEACHER-MARIA",
      commissionRate: 0.20,
      balance: 1500.0,
      organization: "ДМШ им. Гнесиных / Академия Вокала",
      bankDetails: "ИНН 770123456789, Р/С 40802810900000001234, БИК 044525974",
    },
  });

  // Jury Member
  const juryUser = await prisma.user.create({
    data: {
      email: "jury@espressivo.art",
      passwordHash,
      role: "JURY",
      fullName: "Проф. Александр фон Берг",
      phone: "+7 (999) 333-44-55",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
    },
  });

  // Administrator
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@espressivo.art",
      passwordHash,
      role: "ADMIN",
      fullName: "Дирекция espressivo ART",
      phone: "+7 (999) 000-00-01",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300",
    },
  });

  console.log("Users created successfully:");
  console.log("  - participant@espressivo.art / pass1234");
  console.log("  - teacher@espressivo.art / pass1234 (Code: TEACHER-MARIA)");
  console.log("  - jury@espressivo.art / pass1234");
  console.log("  - admin@espressivo.art / pass1234");

  // 4. Create Flagship Competition: espressivo VOCAL — Young Talents
  const competition = await prisma.competition.create({
    data: {
      slug: "espressivo-vocal-2026",
      titleRu: "espressivo VOCAL — Young Talents",
      titleEn: "espressivo VOCAL — Young Talents",
      descriptionRu:
        "Международный конкурс вокального мастерства для молодых исполнителей (5–25 лет). Признание международного жюри, строгая независимая оценка и дипломы высокой печати.",
      descriptionEn:
        "International vocal performance competition for young artists (5–25 y/o). Worldwide adjudication, blind audition standard, and luxury museum-grade diplomas.",
      heroImageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200",
      status: "OPEN",
      entryFee: 2500.0,
      currency: "RUB",
      startDate: new Date("2026-02-01T00:00:00Z"),
      endDate: new Date("2026-06-15T23:59:59Z"),
      judgingEndDate: new Date("2026-06-30T23:59:59Z"),
    },
  });

  // Nominations (4)
  const nomAcademic = await prisma.nomination.create({
    data: {
      competitionId: competition.id,
      code: "ACADEMIC_SOLO",
      titleRu: "Академический вокал (Соло)",
      titleEn: "Classical Vocal (Solo)",
      descriptionRu: "Оперные арии, романсы, старинная музыка и классические произведения.",
      descriptionEn: "Opera arias, art songs, early music, and classical repertoire.",
    },
  });

  const nomPop = await prisma.nomination.create({
    data: {
      competitionId: competition.id,
      code: "POP_VARIETY",
      titleRu: "Эстрадный вокал (Соло)",
      titleEn: "Pop & Variety Vocal (Solo)",
      descriptionRu: "Отечественная и зарубежная эстрада, авторские композиции.",
      descriptionEn: "Contemporary pop, stage performance, and original vocal pieces.",
    },
  });

  const nomJazz = await prisma.nomination.create({
    data: {
      competitionId: competition.id,
      code: "JAZZ_VOCAL",
      titleRu: "Джазовый вокал (Соло)",
      titleEn: "Jazz Vocal (Solo)",
      descriptionRu: "Джазовые стандарты, свинг, босса-нова, скэт-импровизация.",
      descriptionEn: "Jazz standards, swing, bossa nova, and vocal improvisation.",
    },
  });

  const nomEnsemble = await prisma.nomination.create({
    data: {
      competitionId: competition.id,
      code: "CHORAL_ENSEMBLE",
      titleRu: "Вокальный ансамбль и хор",
      titleEn: "Vocal Ensemble & Choir",
      descriptionRu: "Дуэты, трио, квартеты и камерные вокальные ансамбли.",
      descriptionEn: "Duets, trios, quartets, and chamber vocal ensembles.",
    },
  });

  // Age Categories (4)
  const ageCatA = await prisma.ageCategory.create({
    data: {
      competitionId: competition.id,
      code: "CAT_A",
      titleRu: "Категория A (5–8 лет)",
      titleEn: "Category A (5–8 y/o)",
      minAge: 5,
      maxAge: 8,
    },
  });

  const ageCatB = await prisma.ageCategory.create({
    data: {
      competitionId: competition.id,
      code: "CAT_B",
      titleRu: "Категория B (9–12 лет)",
      titleEn: "Category B (9–12 y/o)",
      minAge: 9,
      maxAge: 12,
    },
  });

  const ageCatC = await prisma.ageCategory.create({
    data: {
      competitionId: competition.id,
      code: "CAT_C",
      titleRu: "Категория C (13–16 лет)",
      titleEn: "Category C (13–16 y/o)",
      minAge: 13,
      maxAge: 16,
    },
  });

  const ageCatD = await prisma.ageCategory.create({
    data: {
      competitionId: competition.id,
      code: "CAT_D",
      titleRu: "Категория D (17–25 лет)",
      titleEn: "Category D (17–25 y/o)",
      minAge: 17,
      maxAge: 25,
    },
  });

  console.log("Competition created: espressivo VOCAL — Young Talents (4 nominations, 4 age categories)");

  // 5. Create 5 Realistic Applications in various states
  // 1) DRAFT
  await prisma.application.create({
    data: {
      code: "EXP-2026-1001",
      userId: participantUser.id,
      competitionId: competition.id,
      nominationId: nomAcademic.id,
      ageCategoryId: ageCatB.id,
      participantName: "София Морозова",
      birthDate: new Date("2015-05-12"),
      teacherName: "Смирнова М.А.",
      institution: "ДМШ №1",
      repertoire: "В.А. Моцарт — Ария Керубино (Voi che sapete) из оперы 'Свадьба Фигаро'",
      performanceDuration: 180,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoProvider: "YOUTUBE",
      parentFullName: "Елена Морозова",
      parentEmail: "participant@espressivo.art",
      parentPhone: "+7 (999) 111-22-33",
      consentDataProcess: true,
      consentPublicStream: true,
      status: "DRAFT",
      paymentStatus: "UNPAID",
      referralTeacherId: teacherProfile.id,
    },
  });

  // 2) SUBMITTED
  await prisma.application.create({
    data: {
      code: "EXP-2026-1002",
      userId: participantUser.id,
      competitionId: competition.id,
      nominationId: nomPop.id,
      ageCategoryId: ageCatC.id,
      participantName: "Михаил Васильев",
      birthDate: new Date("2012-08-20"),
      teacherName: "Смирнова М.А.",
      institution: "Эстрадная студия 'Звук'",
      repertoire: "Queen — The Show Must Go On",
      performanceDuration: 215,
      videoUrl: "https://rutube.ru/video/mock1002/",
      videoProvider: "RUTUBE",
      parentFullName: "Ирина Васильева",
      parentEmail: "vasilieva@example.com",
      parentPhone: "+7 (999) 444-55-66",
      consentDataProcess: true,
      consentPublicStream: true,
      status: "SUBMITTED",
      paymentStatus: "PENDING",
      referralTeacherId: teacherProfile.id,
    },
  });

  // 3) PAID (with ledger commission)
  const appPaid = await prisma.application.create({
    data: {
      code: "EXP-2026-1003",
      userId: participantUser.id,
      competitionId: competition.id,
      nominationId: nomJazz.id,
      ageCategoryId: ageCatB.id,
      participantName: "Анна Смирнова",
      birthDate: new Date("2014-03-15"),
      teacherName: "Мария Александровна Смирнова",
      institution: "ДМШ им. Гнесиных",
      repertoire: "George Gershwin — Summertime",
      performanceDuration: 195,
      videoUrl: "https://www.youtube.com/watch?v=mock1003",
      videoProvider: "YOUTUBE",
      parentFullName: "Ольга Смирнова",
      parentEmail: "olga.smirnova@example.com",
      parentPhone: "+7 (999) 555-66-77",
      consentDataProcess: true,
      consentPublicStream: true,
      status: "PAID",
      paymentStatus: "PAID",
      referralTeacherId: teacherProfile.id,
    },
  });

  const tx1003 = await prisma.paymentTransaction.create({
    data: {
      transactionId: "tx_mock_1003_paid",
      applicationId: appPaid.id,
      userId: participantUser.id,
      amount: 2500.0,
      currency: "RUB",
      status: "CONFIRMED",
      provider: "MOCK",
    },
  });

  await prisma.ledgerTransaction.create({
    data: {
      teacherId: teacherProfile.id,
      applicationId: appPaid.id,
      paymentTransactionId: tx1003.id,
      type: "COMMISSION_ACCRUAL",
      amount: 500.0,
      status: "CONFIRMED",
      description: `20% referral commission for application ${appPaid.code}`,
    },
  });

  // 4) UNDER_REVIEW (assigned to jury, draft evaluation)
  const appUnderReview = await prisma.application.create({
    data: {
      code: "EXP-2026-1004",
      userId: participantUser.id,
      competitionId: competition.id,
      nominationId: nomAcademic.id,
      ageCategoryId: ageCatC.id,
      participantName: "Дмитрий Орлов",
      birthDate: new Date("2010-11-04"),
      teacherName: "Мария Александровна Смирнова",
      institution: "Колледж искусств",
      repertoire: "Дж. Каччини — Ave Maria",
      performanceDuration: 230,
      videoUrl: "https://www.youtube.com/watch?v=mock1004",
      videoProvider: "YOUTUBE",
      parentFullName: "Сергей Орлов",
      parentEmail: "orlov@example.com",
      parentPhone: "+7 (999) 777-88-99",
      consentDataProcess: true,
      consentPublicStream: true,
      status: "UNDER_REVIEW",
      paymentStatus: "PAID",
      referralTeacherId: teacherProfile.id,
    },
  });

  const tx1004 = await prisma.paymentTransaction.create({
    data: {
      transactionId: "tx_mock_1004_paid",
      applicationId: appUnderReview.id,
      userId: participantUser.id,
      amount: 2500.0,
      currency: "RUB",
      status: "CONFIRMED",
      provider: "MOCK",
    },
  });

  await prisma.ledgerTransaction.create({
    data: {
      teacherId: teacherProfile.id,
      applicationId: appUnderReview.id,
      paymentTransactionId: tx1004.id,
      type: "COMMISSION_ACCRUAL",
      amount: 500.0,
      status: "CONFIRMED",
      description: `20% referral commission for application ${appUnderReview.code}`,
    },
  });

  await prisma.evaluation.create({
    data: {
      applicationId: appUnderReview.id,
      juryUserId: juryUser.id,
      scoreTechnique: 23,
      scoreMusicality: 22,
      scoreArtistry: 23,
      scoreRepertoire: 22,
      totalScore: 90,
      comment: "Очень выразительное и благородное исполнение. Обратить внимание на атаку звука в верхнем регистре.",
      isDraft: true,
    },
  });

  // 5) EVALUATED / COMPLETED (final score 96, Laureate 1st degree + Certificate)
  const appCompleted = await prisma.application.create({
    data: {
      code: "EXP-2026-1005",
      userId: participantUser.id,
      competitionId: competition.id,
      nominationId: nomAcademic.id,
      ageCategoryId: ageCatD.id,
      participantName: "Екатерина Воронова",
      birthDate: new Date("2008-07-25"),
      teacherName: "Мария Александровна Смирнова",
      institution: "Академия хорового искусства",
      repertoire: "С.В. Рахманинов — Вокализ, соч. 34 № 14",
      performanceDuration: 260,
      videoUrl: "https://www.youtube.com/watch?v=mock1005",
      videoProvider: "YOUTUBE",
      parentFullName: "Татьяна Воронова",
      parentEmail: "voronova@example.com",
      parentPhone: "+7 (999) 888-99-00",
      consentDataProcess: true,
      consentPublicStream: true,
      status: "COMPLETED",
      paymentStatus: "PAID",
      referralTeacherId: teacherProfile.id,
    },
  });

  const tx1005 = await prisma.paymentTransaction.create({
    data: {
      transactionId: "tx_mock_1005_paid",
      applicationId: appCompleted.id,
      userId: participantUser.id,
      amount: 2500.0,
      currency: "RUB",
      status: "CONFIRMED",
      provider: "MOCK",
    },
  });

  await prisma.ledgerTransaction.create({
    data: {
      teacherId: teacherProfile.id,
      applicationId: appCompleted.id,
      paymentTransactionId: tx1005.id,
      type: "COMMISSION_ACCRUAL",
      amount: 500.0,
      status: "CONFIRMED",
      description: `20% referral commission for application ${appCompleted.code}`,
    },
  });

  await prisma.evaluation.create({
    data: {
      applicationId: appCompleted.id,
      juryUserId: juryUser.id,
      scoreTechnique: 24,
      scoreMusicality: 25,
      scoreArtistry: 24,
      scoreRepertoire: 23,
      totalScore: 96,
      comment: "Выдающийся чистый тембр, филировка звука, точная интонация и зрелое художественное прочтение. Браво!",
      isDraft: false,
      submittedAt: new Date(),
    },
  });

  await prisma.certificate.create({
    data: {
      certificateNumber: "ESP-VOC-2026-1005-LAUR1",
      applicationId: appCompleted.id,
      participantName: appCompleted.participantName,
      competitionTitle: competition.titleRu,
      nominationTitle: nomAcademic.titleRu,
      awardDegree: "LAUREATE_1",
      totalScore: 96.0,
      qrCodeToken: "cert_token_voronova_2026",
    },
  });

  console.log("5 realistic applications created (DRAFT, SUBMITTED, PAID, UNDER_REVIEW, COMPLETED).");
  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
