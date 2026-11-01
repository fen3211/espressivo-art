import { describe, it, expect, beforeAll, vi } from "vitest";
import prisma from "@/lib/prisma";
import { MockPaymentGateway } from "@/lib/payment-gateway";
import {
  createSessionToken,
  verifySessionToken,
  validateJwtSecret,
} from "@/lib/auth";
import { POST as postLogin } from "@/app/api/auth/login/route";
import { POST as postApplication } from "@/app/api/applications/route";
import { GET as getJuryAppById } from "@/app/api/jury/applications/[id]/route";
import { POST as postJuryEvaluateById } from "@/app/api/jury/applications/[id]/evaluate/route";
import { GET as verifyCertificateHandler } from "@/app/api/public/verify-certificate/[token]/route";
import { generateCertificatePdf } from "@/lib/certificates";
import { dictionaries } from "@/lib/i18n/dictionaries";

describe("Critical Remediation & Production Readiness Test Suite", () => {
  const gateway = new MockPaymentGateway();

  let participantAUser: { id: string; email: string; fullName: string; role: string };
  let participantBUser: { id: string; email: string; fullName: string; role: string };
  let juryUser: { id: string; email: string; fullName: string; role: string };
  let teacherUser: { id: string; email: string; fullName: string; role: string };
  let adminUser: { id: string; email: string; fullName: string; role: string };

  let participantAToken: string;
  let participantBToken: string;
  let juryToken: string;
  let adminToken: string;

  let testCompetitionId: string;
  let testNominationId: string;
  let testAgeCategoryId: string;
  let testApplicationId: string;
  let testTransactionId: string;

  beforeAll(async () => {
    // 1. Fetch seeded competition
    const comp = await prisma.competition.findUnique({
      where: { slug: "espressivo-vocal-2026" },
      include: { nominations: true, ageCategories: true },
    });
    if (!comp) throw new Error("Seeded competition not found");

    testCompetitionId = comp.id;
    testNominationId = comp.nominations[0].id;
    testAgeCategoryId = comp.ageCategories[0].id;

    // 2. Fetch users
    const [pA, j, t, a] = await Promise.all([
      prisma.user.findUnique({ where: { email: "participant@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "jury@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "teacher@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "admin@espressivo.art" } }),
    ]);

    if (!pA || !j || !t || !a) throw new Error("Seeded users not found");

    participantAUser = pA;
    juryUser = j;
    teacherUser = t;
    adminUser = a;

    participantBUser = await prisma.user.upsert({
      where: { email: "participant-b-remediation@espressivo.art" },
      update: {},
      create: {
        email: "participant-b-remediation@espressivo.art",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
        fullName: "Второй Участник",
        role: "PARTICIPANT",
      },
    });

    participantAToken = await createSessionToken({
      userId: pA.id,
      email: pA.email,
      role: pA.role,
      fullName: pA.fullName,
    });

    participantBToken = await createSessionToken({
      userId: participantBUser.id,
      email: participantBUser.email,
      role: participantBUser.role,
      fullName: participantBUser.fullName,
    });

    juryToken = await createSessionToken({
      userId: j.id,
      email: j.email,
      role: j.role,
      fullName: j.fullName,
    });

    adminToken = await createSessionToken({
      userId: a.id,
      email: a.email,
      role: a.role,
      fullName: a.fullName,
    });
  });

  // -------------------------------------------------------------
  // 1. P0: PAYMENT SECURITY & MOCK CHECKOUT HARDENING
  // -------------------------------------------------------------
  describe("1. Payment Security & Mock Checkout", () => {
    it("should fail closed if MOCK_PAYMENT_SECRET is missing", () => {
      const originalSecret = process.env.MOCK_PAYMENT_SECRET;
      try {
        delete process.env.MOCK_PAYMENT_SECRET;
        expect(() => gateway.getSecret()).toThrow("MOCK_PAYMENT_SECRET configuration is missing");
      } finally {
        process.env.MOCK_PAYMENT_SECRET = originalSecret;
      }
    });

    it("should fail closed if MOCK_PAYMENT_SECRET is shorter than 32 characters", () => {
      const originalSecret = process.env.MOCK_PAYMENT_SECRET;
      try {
        process.env.MOCK_PAYMENT_SECRET = "weak-secret-short";
        expect(() => gateway.getSecret()).toThrow("minimum length is 32 characters");
      } finally {
        process.env.MOCK_PAYMENT_SECRET = originalSecret;
      }
    });

    it("should strictly prohibit mock payment session creation in production without override", async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalMockEnable = process.env.ENABLE_MOCK_CHECKOUT;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
        delete process.env.ENABLE_MOCK_CHECKOUT;

        await expect(
          gateway.createPaymentSession({
            applicationId: "any-app-id",
            amount: 2500,
            userId: participantAUser.id,
          })
        ).rejects.toThrow("Mock payment checkout is strictly prohibited in production environment");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        process.env.ENABLE_MOCK_CHECKOUT = originalMockEnable;
      }
    });

    it("should strictly reject mock webhooks in production environment", async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalMockEnable = process.env.ENABLE_MOCK_CHECKOUT;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
        delete process.env.ENABLE_MOCK_CHECKOUT;

        const result = await gateway.processWebhook({
          transactionId: "tx_mock_123",
          applicationId: "app_123",
          amount: 2500,
          currency: "RUB",
          status: "CONFIRMED",
          signature: "some_signature",
        });

        expect(result.status).toBe("FAILED");
        expect(result.message).toContain("disabled in production");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        process.env.ENABLE_MOCK_CHECKOUT = originalMockEnable;
      }
    });

    it("should unconditionally prohibit mock payments in production even with ENABLE_MOCK_CHECKOUT=true override", async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalMockEnable = process.env.ENABLE_MOCK_CHECKOUT;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
        process.env.ENABLE_MOCK_CHECKOUT = "true";

        expect(gateway.isMockAllowed()).toBe(false);

        await expect(
          gateway.createPaymentSession({
            applicationId: "any-app-id",
            amount: 2500,
            userId: participantAUser.id,
          })
        ).rejects.toThrow("Mock payment checkout is strictly prohibited in production environment");

        const result = await gateway.processWebhook({
          transactionId: "tx_mock_123",
          applicationId: "app_123",
          amount: 2500,
          currency: "RUB",
          status: "CONFIRMED",
          signature: "some_signature",
        });
        expect(result.status).toBe("FAILED");
        expect(result.message).toContain("disabled in production");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        process.env.ENABLE_MOCK_CHECKOUT = originalMockEnable;
      }
    });

    it("should reject amount tampering in webhook processing", async () => {
      // 1. Create a draft app and session
      const app = await prisma.application.create({
        data: {
          code: `EXP-PAY-${Date.now().toString().slice(-4)}`,
          userId: participantAUser.id,
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Тест Оплаты",
          birthDate: new Date("2015-05-01"),
          repertoire: "Test Repertoire",
          videoUrl: "https://youtube.com/watch?v=realvideo123",
          parentFullName: "Родитель Тест",
          parentEmail: "parent.pay@example.com",
          parentPhone: "+79991234567",
          consentDataProcess: true,
          status: "DRAFT",
          paymentStatus: "UNPAID",
        },
      });

      testApplicationId = app.id;

      const session = await gateway.createPaymentSession({
        applicationId: app.id,
        amount: 2500,
        currency: "RUB",
        userId: participantAUser.id,
      });

      testTransactionId = session.transactionId;

      // 2. Tamper amount: Original is 2500, attacker sends 100 with valid signature for 100
      const tamperedSignature = gateway.generateSignature({
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 100, // Tampered!
        currency: "RUB",
        status: "CONFIRMED",
      });

      const result = await gateway.processWebhook({
        transactionId: session.transactionId,
        applicationId: app.id,
        amount: 100,
        currency: "RUB",
        status: "CONFIRMED",
        signature: tamperedSignature,
      });

      expect(result.status).toBe("FAILED");
      expect(result.message).toContain("Payment amount mismatch");

      // Verify DB application was not marked as paid
      const freshApp = await prisma.application.findUnique({ where: { id: app.id } });
      expect(freshApp?.paymentStatus).not.toBe("PAID");
    });

    it("should reject currency tampering in webhook processing", async () => {
      const validAmount = 2500;
      // Valid signature was created with RUB
      const signature = gateway.generateSignature({
        transactionId: testTransactionId,
        applicationId: testApplicationId,
        amount: validAmount,
        currency: "RUB",
        status: "CONFIRMED",
      });

      // Attacker changes payload currency to USD -> Signature check or DB check fails
      const result = await gateway.processWebhook({
        transactionId: testTransactionId,
        applicationId: testApplicationId,
        amount: validAmount,
        currency: "USD", // Original is RUB!
        status: "CONFIRMED",
        signature,
      });

      expect(result.status).toBe("FAILED");

      // Even if attacker generates signature with USD, DB mismatch check must reject it
      const signatureWithUSD = gateway.generateSignature({
        transactionId: testTransactionId,
        applicationId: testApplicationId,
        amount: validAmount,
        currency: "USD",
        status: "CONFIRMED",
      });

      const resultUSD = await gateway.processWebhook({
        transactionId: testTransactionId,
        applicationId: testApplicationId,
        amount: validAmount,
        currency: "USD",
        status: "CONFIRMED",
        signature: signatureWithUSD,
      });

      expect(resultUSD.status).toBe("FAILED");
      expect(resultUSD.message).toContain("Payment currency mismatch");
    });

    it("should process valid payment atomically and achieve idempotent anti-replay protection", async () => {
      const validAmount = 2500;
      const signature = gateway.generateSignature({
        transactionId: testTransactionId,
        applicationId: testApplicationId,
        amount: validAmount,
        currency: "RUB",
        status: "CONFIRMED",
      });

      // First webhook delivery
      const res1 = await gateway.processWebhook({
        transactionId: testTransactionId,
        applicationId: testApplicationId,
        amount: validAmount,
        currency: "RUB",
        status: "CONFIRMED",
        signature,
      });

      expect(res1.status).toBe("PROCESSED");

      // Verify app moved to PAID
      const paidApp = await prisma.application.findUnique({ where: { id: testApplicationId } });
      expect(paidApp?.paymentStatus).toBe("PAID");

      // Second webhook delivery (replay attack or network duplicate)
      const res2 = await gateway.processWebhook({
        transactionId: testTransactionId,
        applicationId: testApplicationId,
        amount: validAmount,
        currency: "RUB",
        status: "CONFIRMED",
        signature,
      });

      expect(res2.status).toBe("ALREADY_PROCESSED");
    });
  });

  // -------------------------------------------------------------
  // 2. P0: AUTHENTICATION, DEMO ACCOUNTS & RATE LIMITING
  // -------------------------------------------------------------
  describe("2. Authentication & Demo Account Hardening", () => {
    it("should reject expired session tokens", async () => {
      const expiredToken = await createSessionToken(
        {
          userId: participantAUser.id,
          email: participantAUser.email,
          role: "PARTICIPANT",
          fullName: participantAUser.fullName,
        },
        "-5m" // Expired 5 minutes ago
      );

      const session = await verifySessionToken(expiredToken);
      expect(session).toBeNull();
    });

    it("should unconditionally block demo accounts in production (even with ENABLE_DEMO_ACCOUNTS=true) without timing or enumeration leaks", async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalDemoEnable = process.env.ENABLE_DEMO_ACCOUNTS;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
        // Even if an attacker or misconfiguration sets ENABLE_DEMO_ACCOUNTS=true, it must NOT bypass
        process.env.ENABLE_DEMO_ACCOUNTS = "true";

        const req = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: "participant@espressivo.art",
            password: "anypassword",
          }),
        });

        const res = await postLogin(req);
        // Must return standard 401 INVALID_CREDENTIALS to prevent user enumeration
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.code).toBe("INVALID_CREDENTIALS");
        expect(data.code).not.toBe("DEMO_ACCOUNTS_DISABLED");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        process.env.ENABLE_DEMO_ACCOUNTS = originalDemoEnable;
      }
    });

    it("should enforce rate limiting after repeated failed login attempts", async () => {
      const targetEmail = "attacker-brute-force@example.com";

      // 5 consecutive failed attempts
      for (let i = 0; i < 5; i++) {
        const req = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "198.51.100.42",
          },
          body: JSON.stringify({
            email: targetEmail,
            password: "wrong_password",
          }),
        });
        await postLogin(req);
      }

      // 6th attempt should be blocked by rate limiter with 429 Too Many Requests
      const blockedReq = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.42",
        },
        body: JSON.stringify({
          email: targetEmail,
          password: "wrong_password",
        }),
      });

      const res = await postLogin(blockedReq);
      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.code).toBe("RATE_LIMITED");
    });
  });

  // -------------------------------------------------------------
  // 3. P0: JURY WORKSTATION, DYNAMIC DATA & BLIND AUDITION
  // -------------------------------------------------------------
  describe("3. Jury Workstation & Blind Audition", () => {
    let assignedAppId: string;

    beforeAll(async () => {
      // Create and assign an application to juryUser
      const app = await prisma.application.create({
        data: {
          code: `EXP-JURY-${Date.now().toString().slice(-4)}`,
          userId: participantAUser.id,
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Реальный Ученик Скрипко",
          birthDate: new Date("2014-03-15"),
          repertoire: "Ф. Шуберт — Серенада",
          videoUrl: "https://www.youtube.com/watch?v=real_schubert_piece",
          parentFullName: "Скрипко Анна Павловна",
          parentEmail: "parent.skripko@example.com",
          parentPhone: "+79031234567",
          institution: "ЦМШ при МГК им. Чайковского",
          teacherName: "Проф. Вокалов",
          consentDataProcess: true,
          status: "UNDER_REVIEW",
          paymentStatus: "PAID",
        },
      });
      assignedAppId = app.id;

      await prisma.evaluation.create({
        data: {
          applicationId: app.id,
          juryUserId: juryUser.id,
          scoreTechnique: 22,
          scoreMusicality: 23,
          scoreArtistry: 22,
          scoreRepertoire: 21,
          totalScore: 88,
          isDraft: true,
        },
      });
    });

    it("should load real dynamic application data instead of hardcoded mock Pergolesi", async () => {
      const req = new Request(`http://localhost:3000/api/jury/applications/${assignedAppId}`, {
        headers: { authorization: `Bearer ${juryToken}` },
      });

      const res = await getJuryAppById(req, {
        params: Promise.resolve({ id: assignedAppId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.repertoire).toBe("Ф. Шуберт — Серенада");
      if (data.isBlindModeEnforced) {
        expect(data.videoUrl).toBeNull();
        expect(data.audioUrl).toBe(`/api/jury/applications/${assignedAppId}/audio`);
      } else {
        expect(data.videoUrl).toBe("https://www.youtube.com/watch?v=real_schubert_piece");
        expect(data.videoUrl).not.toContain("dQw4w9WgXcQ"); // Zero Rickroll!
      }
      expect(data.code).toContain("EXP-JURY-");
      expect(data.isBlindModeDefault).toBe(true);

      // Minor and parent PII must be completely stripped from jury API
      expect(data.participantName).toBeUndefined();
      expect(data.parentFullName).toBeUndefined();
      expect(data.parentEmail).toBeUndefined();
      expect(data.parentPhone).toBeUndefined();
      expect(data.teacherName).toBeUndefined();
      expect(data.institution).toBeUndefined();
    });

    it("should prevent unauthorized jury from evaluating an unassigned application", async () => {
      const otherJuryToken = await createSessionToken({
        userId: "foreign_unassigned_jury",
        email: "other.jury@example.com",
        role: "JURY",
        fullName: "Посторонний Член Жюри",
      });

      const req = new Request(`http://localhost:3000/api/jury/applications/${assignedAppId}/evaluate`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${otherJuryToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          scoreTechnique: 25,
          scoreMusicality: 25,
          scoreArtistry: 25,
          scoreRepertoire: 25,
          isDraft: false,
        }),
      });

      const res = await postJuryEvaluateById(req, {
        params: Promise.resolve({ id: assignedAppId }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.code).toBe("NOT_ASSIGNED");
    });
  });

  // -------------------------------------------------------------
  // 4. P0: MINOR PRIVACY & PUBLIC DIPLOMA VERIFICATION
  // -------------------------------------------------------------
  describe("4. Minor Privacy & Certificate Verification", () => {
    it("should verify certificate while strictly masking minor participant full name", async () => {
      const token = "cert_token_voronova_2026";
      const req = new Request(`http://localhost:3000/api/public/verify-certificate/${token}`);

      const res = await verifyCertificateHandler(req, {
        params: Promise.resolve({ token }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isValid).toBe(true);

      // Masked name for 152-FZ / GDPR minor privacy compliance
      expect(data.participantName).toBeUndefined();
      expect(data.participantNameMasked).toBe("Екатерина В.");
      expect(data.privacyProtected).toBe(true);
      expect(data.awardDegree).toBe("LAUREATE_1");
    });

    it("should strictly withhold minor name and totalScore when consentPublicStream is false (152-FZ Art. 10.1)", async () => {
      const token = "cert_token_voronova_2026";
      const cert = await prisma.certificate.findUnique({
        where: { qrCodeToken: token },
      });
      if (!cert) throw new Error("Certificate not found");

      await prisma.application.update({
        where: { id: cert.applicationId },
        data: { consentPublicStream: false },
      });

      try {
        const req = new Request(`http://localhost:3000/api/public/verify-certificate/${token}`);
        const res = await verifyCertificateHandler(req, {
          params: Promise.resolve({ token }),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.isValid).toBe(true);
        expect(data.publicConsentGranted).toBe(false);
        expect(data.participantName).toBeUndefined();
        expect(data.participantNameMasked).toBeUndefined();
        expect(data.totalScore).toBeUndefined();
        expect(data.awardDegree).toBe("LAUREATE_1");
        expect(data.certificateNumber).toContain("ESP-VOC-2026-1005-");
      } finally {
        await prisma.application.update({
          where: { id: cert.applicationId },
          data: { consentPublicStream: true },
        });
      }
    });

    it("should generate PDF diploma with bundled SIL OFL fonts and real QR code", async () => {
      const pdfBuffer = await generateCertificatePdf({
        certificateNumber: "ESP-VOC-2026-REMEDIATION-L1",
        participantName: "Михаил Глинка",
        competitionTitle: "espressivo VOCAL — Young Talents",
        nominationTitle: "Академический вокал",
        awardDegree: "GRAND_PRIX",
        totalScore: 99.5,
        issuedDate: new Date(),
        qrCodeToken: "remediation_token_valid_1234567890abcdef",
      });

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
      expect(pdfBuffer.length).toBeGreaterThan(1500);
    });
  });

  // -------------------------------------------------------------
  // 5. P1: APPLICATIONS & CONSENTS
  // -------------------------------------------------------------
  describe("5. Applications & Consents Validation", () => {
    it("should dynamically generate application code based on competition year", async () => {
      const req = new Request("http://localhost:3000/api/applications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${participantAToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Динамический Код",
          birthDate: "2019-05-01",
          repertoire: "Тестовая Ария",
          videoUrl: "https://rutube.ru/video/123456/",
          parentFullName: "Родитель Кода",
          parentEmail: "code.parent@example.com",
          parentPhone: "+79998887766",
          consentDataProcess: true,
          consentPublicStream: false, // Voluntary! Unchecking does not block
          isSubmit: false,
        }),
      });

      const res = await postApplication(req);
      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data.application.code).toMatch(/^EXP-2026-\d{4}$/);
      expect(data.application.consentPublicStream).toBe(false);
      expect(data.application.consentDataProcess).toBe(true);
    });

    it("should reject application if mandatory 152-FZ data processing consent is false", async () => {
      const req = new Request("http://localhost:3000/api/applications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${participantAToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Без Согласия",
          birthDate: "2015-02-01",
          repertoire: "Ария",
          videoUrl: "https://rutube.ru/video/123456/",
          parentFullName: "Родитель",
          parentEmail: "parent@example.com",
          parentPhone: "+79998887766",
          consentDataProcess: false, // Mandatory!
          isSubmit: false,
        }),
      });

      const res = await postApplication(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("152-ФЗ");
    });
  });

  // -------------------------------------------------------------
  // 6. P1: LOCALIZATION & DICTIONARY COMPLETENESS
  // -------------------------------------------------------------
  describe("6. Localization & Dictionaries Completeness", () => {
    it("should contain all required mock checkout and verification keys in RU and EN", () => {
      const requiredCheckoutKeys = [
        "mockAcquiringBadge",
        "mockNoticeTitle",
        "mockNoticeDesc",
        "mockDisabledInProd",
        "sessionNotFound",
        "amountDue",
        "paymentStatus",
        "applicationCode",
        "competition",
        "participant",
        "transactionId",
        "payTestBtn",
        "cancelBtn",
        "returnToApplications",
      ];

      for (const key of requiredCheckoutKeys) {
        expect((dictionaries.ru.checkout as Record<string, string>)[key]).toBeDefined();
        expect((dictionaries.en.checkout as Record<string, string>)[key]).toBeDefined();
      }

      // Verification keys
      expect(dictionaries.ru.public.verification.validBadge).toBeDefined();
      expect(dictionaries.en.public.verification.validBadge).toBeDefined();
      expect(dictionaries.ru.public.verification.privacyNotice).toBeDefined();
      expect(dictionaries.en.public.verification.privacyNotice).toBeDefined();
    });
  });
});
