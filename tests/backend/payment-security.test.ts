import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import { MockPaymentGateway } from "@/lib/payment-gateway";
import crypto from "crypto";

describe("Payment Security & Concurrency Hardening (lib/payment-gateway.ts)", () => {
  const gateway = new MockPaymentGateway();
  let testCompetitionId: string;
  let testNominationId: string;
  let testAgeCategoryId: string;
  let testTeacherUserId: string;
  let testTeacherProfileId: string;
  let testParticipantUserId: string;

  beforeAll(async () => {
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

  // -------------------------------------------------------------
  // 1. UNCONDITIONAL PRODUCTION MOCK PROHIBITION
  // -------------------------------------------------------------
  describe("1. Production Mock Prohibition Guard", () => {
    it("should unconditionally forbid mock payments in NODE_ENV=production, regardless of ENABLE_MOCK_CHECKOUT", async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalMock = process.env.ENABLE_MOCK_CHECKOUT;

      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";

        // Test with ENABLE_MOCK_CHECKOUT=true
        process.env.ENABLE_MOCK_CHECKOUT = "true";
        expect(gateway.isMockAllowed()).toBe(false);

        // Test with ENABLE_MOCK_CHECKOUT=1
        process.env.ENABLE_MOCK_CHECKOUT = "1";
        expect(gateway.isMockAllowed()).toBe(false);

        // Test without ENABLE_MOCK_CHECKOUT
        delete process.env.ENABLE_MOCK_CHECKOUT;
        expect(gateway.isMockAllowed()).toBe(false);

        // createPaymentSession must throw
        await expect(
          gateway.createPaymentSession({
            applicationId: "mock_app",
            amount: 2500,
            userId: testParticipantUserId,
          })
        ).rejects.toThrow("Mock payment checkout is strictly prohibited in production environment");

        // processWebhook must fail closed
        const result = await gateway.processWebhook({
          transactionId: "mock_tx_prod_test",
          applicationId: "mock_app",
          amount: 2500,
          currency: "RUB",
          status: "CONFIRMED",
          signature: "some_signature",
        });

        expect(result.received).toBe(false);
        expect(result.status).toBe("FAILED");
        expect(result.message).toContain("disabled in production");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        process.env.ENABLE_MOCK_CHECKOUT = originalMock;
      }
    });
  });

  // -------------------------------------------------------------
  // 2. HMAC-SHA256 SIGNATURE & CANONICAL CURRENCY VALIDATION
  // -------------------------------------------------------------
  describe("2. Strict HMAC-SHA256 & Currency Validation", () => {
    it("should generate canonical signature with format txId:amount:currency:status", () => {
      const txId = "test_tx_canonical_123";
      const amount = 2500;
      const currency = "rub"; // lowercase input
      const status = "CONFIRMED";

      const signature = gateway.generateSignature({
        transactionId: txId,
        amount,
        currency,
        status,
      });

      const secret = gateway.getSecret();
      const expectedRaw = `${txId}:${amount}:RUB:${status}`;
      const expectedSig = crypto.createHmac("sha256", secret).update(expectedRaw).digest("hex");

      expect(signature).toBe(expectedSig);
    });

    it("should fail closed if currency is missing or empty in generateSignature and verifySignature", () => {
      expect(() =>
        gateway.generateSignature({
          transactionId: "tx_1",
          amount: 2500,
          currency: "",
          status: "CONFIRMED",
        })
      ).toThrow("currency is mandatory");

      const isVerified = gateway.verifySignature(
        {
          transactionId: "tx_1",
          amount: 2500,
          currency: "",
          status: "CONFIRMED",
        },
        "any_signature"
      );
      expect(isVerified).toBe(false);
    });

    it("should fail closed when webhook payload is missing currency", async () => {
      const result = await gateway.processWebhook({
        transactionId: "tx_no_curr",
        applicationId: "app_no_curr",
        amount: 2500,
        currency: "" as unknown as string,
        status: "CONFIRMED",
        signature: "dummy_sig",
      });

      expect(result.received).toBe(false);
      expect(result.status).toBe("FAILED");
      expect(result.message).toContain("Payment currency is mandatory");
    });

    it("should fail closed when currency does not match saved transaction currency in DB", async () => {
      const app = await prisma.application.create({
        data: {
          code: `EXP-CURR-${Date.now().toString().slice(-4)}`,
          userId: testParticipantUserId,
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Валютный Ученик",
          birthDate: new Date("2015-02-01"),
          repertoire: "Currency Test Repertoire",
          videoUrl: "https://youtube.com/watch?v=curr",
          parentFullName: "Родитель Валюта",
          parentEmail: "curr@test.com",
          parentPhone: "+79993334455",
          consentDataProcess: true,
          status: "SUBMITTED",
          paymentStatus: "PENDING",
        },
      });

      const session = await gateway.createPaymentSession({
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        userId: testParticipantUserId,
      });

      // Valid signature for USD
      const usdSignature = gateway.generateSignature({
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 2500,
        currency: "USD",
        status: "CONFIRMED",
      });

      // Webhook sends USD, but DB holds RUB
      const result = await gateway.processWebhook({
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 2500,
        currency: "USD",
        status: "CONFIRMED",
        signature: usdSignature,
      });

      expect(result.received).toBe(false);
      expect(result.status).toBe("FAILED");
      expect(result.message).toContain("Payment currency mismatch");

      const tx = await prisma.paymentTransaction.findUnique({
        where: { transactionId: session.transactionId },
      });
      expect(tx?.status).toBe("PENDING");
    });

    it("should enforce timing-safe comparison on invalid signatures of varying lengths", () => {
      const validSig = gateway.generateSignature({
        transactionId: "tx_test_timing",
        amount: 2500,
        currency: "RUB",
        status: "CONFIRMED",
      });

      // Too short
      expect(
        gateway.verifySignature(
          { transactionId: "tx_test_timing", amount: 2500, currency: "RUB", status: "CONFIRMED" },
          "short"
        )
      ).toBe(false);

      // Same length (64 chars) but corrupted byte
      const corruptedSig = "a" + validSig.slice(1);
      expect(
        gateway.verifySignature(
          { transactionId: "tx_test_timing", amount: 2500, currency: "RUB", status: "CONFIRMED" },
          corruptedSig
        )
      ).toBe(false);

      // Exact match
      expect(
        gateway.verifySignature(
          { transactionId: "tx_test_timing", amount: 2500, currency: "RUB", status: "CONFIRMED" },
          validSig
        )
      ).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // 3. ATOMIC CAS & CONCURRENCY RACE CONDITION PROTECTION
  // -------------------------------------------------------------
  describe("3. Webhook Idempotency & Concurrency Race Condition Protection", () => {
    it("should protect against simultaneous concurrent webhooks using atomic CAS without double commission", async () => {
      // 1. Snapshot teacher balance before
      const teacherBefore = await prisma.teacherProfile.findUnique({
        where: { id: testTeacherProfileId },
      });
      const balanceBefore = teacherBefore?.balance || 0;

      // 2. Create dedicated application
      const app = await prisma.application.create({
        data: {
          code: `EXP-RACE-${Date.now().toString().slice(-4)}`,
          userId: testParticipantUserId,
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Гонка Запросов",
          birthDate: new Date("2014-04-01"),
          repertoire: "Race Repertoire",
          videoUrl: "https://youtube.com/watch?v=race",
          parentFullName: "Родитель Гонка",
          parentEmail: "race@test.com",
          parentPhone: "+79994445566",
          consentDataProcess: true,
          referralTeacherId: testTeacherProfileId,
          status: "SUBMITTED",
          paymentStatus: "PENDING",
        },
      });

      const session = await gateway.createPaymentSession({
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        userId: testParticipantUserId,
      });

      const signature = gateway.generateSignature({
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        status: "CONFIRMED",
      });

      const webhookPayload = {
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        status: "CONFIRMED" as const,
        signature,
      };

      // 3. Fire 5 concurrent webhooks SIMULTANEOUSLY to simulate high-load network race condition
      const concurrentAttempts = [
        gateway.processWebhook(webhookPayload),
        gateway.processWebhook(webhookPayload),
        gateway.processWebhook(webhookPayload),
        gateway.processWebhook(webhookPayload),
        gateway.processWebhook(webhookPayload),
      ];

      const results = await Promise.all(concurrentAttempts);

      // Exactly ONE must be PROCESSED
      const processedCount = results.filter((r) => r.status === "PROCESSED").length;
      const alreadyProcessedCount = results.filter((r) => r.status === "ALREADY_PROCESSED").length;

      expect(processedCount).toBe(1);
      expect(alreadyProcessedCount).toBe(4);

      // 4. Verify teacher balance incremented EXACTLY ONCE (2500 * 0.20 = 500)
      const teacherAfter = await prisma.teacherProfile.findUnique({
        where: { id: testTeacherProfileId },
      });
      expect(teacherAfter?.balance).toBe(balanceBefore + 500);

      // 5. Verify LedgerTransaction has EXACTLY 1 commission accrual entry
      const commissionEntries = await prisma.ledgerTransaction.findMany({
        where: {
          applicationId: app.id,
          type: "COMMISSION_ACCRUAL",
        },
      });
      expect(commissionEntries.length).toBe(1);
      expect(commissionEntries[0].amount).toBe(500);
      expect(commissionEntries[0].status).toBe("CONFIRMED");

      // 6. Verify PaymentTransaction status is CONFIRMED
      const finalTx = await prisma.paymentTransaction.findUnique({
        where: { transactionId: session.transactionId },
      });
      expect(finalTx?.status).toBe("CONFIRMED");

      // 7. Verify subsequent late webhook delivery also returns ALREADY_PROCESSED
      const lateArrival = await gateway.processWebhook(webhookPayload);
      expect(lateArrival.status).toBe("ALREADY_PROCESSED");

      const teacherFinal = await prisma.teacherProfile.findUnique({
        where: { id: testTeacherProfileId },
      });
      expect(teacherFinal?.balance).toBe(balanceBefore + 500);
    });

    it("should prevent FAILED webhook from overwriting an already CONFIRMED transaction", async () => {
      const app = await prisma.application.create({
        data: {
          code: `EXP-FAILOVER-${Date.now().toString().slice(-4)}`,
          userId: testParticipantUserId,
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Защита от Перезаписи",
          birthDate: new Date("2014-04-01"),
          repertoire: "Protection Piece",
          videoUrl: "https://youtube.com/watch?v=failover",
          parentFullName: "Родитель Защита",
          parentEmail: "protection@test.com",
          parentPhone: "+79995556677",
          consentDataProcess: true,
          status: "SUBMITTED",
          paymentStatus: "PENDING",
        },
      });

      const session = await gateway.createPaymentSession({
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        userId: testParticipantUserId,
      });

      const confirmSig = gateway.generateSignature({
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        status: "CONFIRMED",
      });

      // Confirm payment
      const resConfirm = await gateway.processWebhook({
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        status: "CONFIRMED",
        signature: confirmSig,
      });
      expect(resConfirm.status).toBe("PROCESSED");

      // Try to send FAILED webhook for the same transaction
      const failSig = gateway.generateSignature({
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        status: "FAILED",
      });

      const resFail = await gateway.processWebhook({
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        status: "FAILED",
        signature: failSig,
      });

      expect(resFail.status).toBe("ALREADY_PROCESSED");

      const txRecord = await prisma.paymentTransaction.findUnique({
        where: { transactionId: session.transactionId },
      });
      expect(txRecord?.status).toBe("CONFIRMED");
    });
  });
});
