import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/prisma";
import { MockPaymentGateway } from "@/lib/payment-gateway";

describe("Payment & Double-Entry Ledger Module (lib/payment-gateway.ts)", () => {
  const gateway = new MockPaymentGateway();
  let testCompetitionId: string;
  let testNominationId: string;
  let testAgeCategoryId: string;
  let testTeacherUserId: string;
  let testTeacherProfileId: string;
  let testParticipantUserId: string;

  beforeAll(async () => {
    // Lookup seeded records
    const comp = await prisma.competition.findUnique({
      where: { slug: "espressivo-vocal-2026" },
      include: { nominations: true, ageCategories: true },
    });
    if (!comp) throw new Error("Seeded competition not found");

    testCompetitionId = comp.id;
    testNominationId = comp.nominations[0].id;
    testAgeCategoryId = comp.ageCategories[0].id;

    const teacher = await prisma.teacherProfile.findUnique({
      where: { referralCode: "TEACHER-MARIA" },
      include: { user: true },
    });
    if (!teacher) throw new Error("Seeded teacher not found");

    testTeacherUserId = teacher.user.id;
    testTeacherProfileId = teacher.id;

    const participant = await prisma.user.findUnique({
      where: { email: "participant@espressivo.art" },
    });
    if (!participant) throw new Error("Seeded participant not found");
    testParticipantUserId = participant.id;
  });

  it("should create payment session with PENDING transaction", async () => {
    // Create new draft application for test
    const app = await prisma.application.create({
      data: {
        code: `EXP-TEST-${Date.now().toString().slice(-4)}`,
        userId: testParticipantUserId,
        competitionId: testCompetitionId,
        nominationId: testNominationId,
        ageCategoryId: testAgeCategoryId,
        participantName: "Тестовый Ученик",
        birthDate: new Date("2015-01-01"),
        repertoire: "Test Repertoire Piece",
        videoUrl: "https://www.youtube.com/watch?v=test",
        parentFullName: "Родитель Тест",
        parentEmail: "parent@test.com",
        parentPhone: "+79990001122",
        consentDataProcess: true,
        referralTeacherId: testTeacherProfileId,
        status: "DRAFT",
        paymentStatus: "UNPAID",
      },
    });

    const session = await gateway.createPaymentSession({
      applicationId: app.id,
      amount: 2500,
      userId: testParticipantUserId,
    });

    expect(session.paymentUrl).toContain(session.transactionId);

    const txRecord = await prisma.paymentTransaction.findUnique({
      where: { transactionId: session.transactionId },
    });
    expect(txRecord).not.toBeNull();
    expect(txRecord?.status).toBe("PENDING");
    expect(txRecord?.amount).toBe(2500);

    const updatedApp = await prisma.application.findUnique({ where: { id: app.id } });
    expect(updatedApp?.paymentStatus).toBe("PENDING");
  });

  it("should process webhook and calculate exact 20% teacher commission", async () => {
    // 1. Get initial teacher balance
    const teacherBefore = await prisma.teacherProfile.findUnique({
      where: { id: testTeacherProfileId },
    });
    const balanceBefore = teacherBefore?.balance || 0;

    // 2. Create application
    const app = await prisma.application.create({
      data: {
        code: `EXP-COMM-${Date.now().toString().slice(-4)}`,
        userId: testParticipantUserId,
        competitionId: testCompetitionId,
        nominationId: testNominationId,
        ageCategoryId: testAgeCategoryId,
        participantName: "Ученик Для Комиссии",
        birthDate: new Date("2014-06-01"),
        repertoire: "Commission Test Repertoire",
        videoUrl: "https://www.youtube.com/watch?v=comm",
        parentFullName: "Родитель Комиссии",
        parentEmail: "parent-comm@test.com",
        parentPhone: "+79991112233",
        consentDataProcess: true,
        referralTeacherId: testTeacherProfileId,
        status: "SUBMITTED",
        paymentStatus: "PENDING",
      },
    });

    const session = await gateway.createPaymentSession({
      applicationId: app.id,
      amount: 2500,
      userId: testParticipantUserId,
    });

    // 3. Generate signature
    const signature = gateway.generateSignature({
      transactionId: session.transactionId,
      applicationId: app.id,
      amount: 2500,
      currency: "RUB",
      status: "CONFIRMED",
    });

    // 4. Process webhook
    const result = await gateway.processWebhook({
      transactionId: session.transactionId,
      applicationId: app.id,
      amount: 2500,
      currency: "RUB",
      status: "CONFIRMED",
      signature,
    });

    expect(result.received).toBe(true);
    expect(result.status).toBe("PROCESSED");

    // 5. Verify teacher balance incremented by 20% (2500 * 0.20 = 500)
    const teacherAfter = await prisma.teacherProfile.findUnique({
      where: { id: testTeacherProfileId },
    });
    expect(teacherAfter?.balance).toBe(balanceBefore + 500);

    // 6. Verify ledger transaction recorded
    const ledger = await prisma.ledgerTransaction.findFirst({
      where: {
        applicationId: app.id,
        type: "COMMISSION_ACCRUAL",
      },
    });
    expect(ledger).not.toBeNull();
    expect(ledger?.amount).toBe(500);
    expect(ledger?.status).toBe("CONFIRMED");

    // 7. Verify application marked PAID
    const appAfter = await prisma.application.findUnique({ where: { id: app.id } });
    expect(appAfter?.paymentStatus).toBe("PAID");
    expect(appAfter?.status).toBe("PAID");
  });

  it("should enforce idempotency and reject duplicate webhook replays", async () => {
    // Create transaction & application
    const app = await prisma.application.create({
      data: {
        code: `EXP-IDEM-${Date.now().toString().slice(-4)}`,
        userId: testParticipantUserId,
        competitionId: testCompetitionId,
        nominationId: testNominationId,
        ageCategoryId: testAgeCategoryId,
        participantName: "Ученик Идемпотентность",
        birthDate: new Date("2014-06-01"),
        repertoire: "Idempotency Piece",
        videoUrl: "https://www.youtube.com/watch?v=idem",
        parentFullName: "Родитель Идем",
        parentEmail: "idem@test.com",
        parentPhone: "+79998887766",
        consentDataProcess: true,
        referralTeacherId: testTeacherProfileId,
        status: "SUBMITTED",
        paymentStatus: "PENDING",
      },
    });

    const session = await gateway.createPaymentSession({
      applicationId: app.id,
      amount: 2500,
      userId: testParticipantUserId,
    });

    const signature = gateway.generateSignature({
      transactionId: session.transactionId,
      applicationId: app.id,
      amount: 2500,
      currency: "RUB",
      status: "CONFIRMED",
    });

    // First arrival
    const firstCall = await gateway.processWebhook({
      transactionId: session.transactionId,
      applicationId: app.id,
      amount: 2500,
      currency: "RUB",
      status: "CONFIRMED",
      signature,
    });
    expect(firstCall.status).toBe("PROCESSED");

    const teacherMid = await prisma.teacherProfile.findUnique({
      where: { id: testTeacherProfileId },
    });
    const balanceMid = teacherMid?.balance || 0;

    // Second arrival: EXACT SAME WEBHOOK PAYLOAD
    const secondCall = await gateway.processWebhook({
      transactionId: session.transactionId,
      applicationId: app.id,
      amount: 2500,
      currency: "RUB",
      status: "CONFIRMED",
      signature,
    });

    // MUST return ALREADY_PROCESSED
    expect(secondCall.received).toBe(true);
    expect(secondCall.status).toBe("ALREADY_PROCESSED");

    // Teacher balance MUST NOT change on duplicate
    const teacherFinal = await prisma.teacherProfile.findUnique({
      where: { id: testTeacherProfileId },
    });
    expect(teacherFinal?.balance).toBe(balanceMid);

    // Only 1 ledger transaction must exist for this application
    const ledgerCount = await prisma.ledgerTransaction.count({
      where: {
        applicationId: app.id,
        type: "COMMISSION_ACCRUAL",
      },
    });
    expect(ledgerCount).toBe(1);
  });

  it("should reject webhook with invalid signature", async () => {
    const fakeSignature = "invalid_signature_hex_1234567890abcdef1234567890abcdef1234567890abcdef";
    const result = await gateway.processWebhook({
      transactionId: "non_existent_tx",
      applicationId: "non_existent_app",
      amount: 2500,
      currency: "RUB",
      status: "CONFIRMED",
      signature: fakeSignature,
    });

    expect(result.received).toBe(false);
    expect(result.status).toBe("FAILED");
    expect(result.message).toContain("signature");
  });
});
