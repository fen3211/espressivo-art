import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { MockPaymentGateway } from "@/lib/payment-gateway";
import { GET as getApplicationById, PUT as putApplicationById, DELETE as deleteApplicationById } from "@/app/api/applications/[id]/route";
import { POST as postApplication } from "@/app/api/applications/route";
import { GET as getJuryApplications } from "@/app/api/jury/applications/route";
import { POST as postJuryEvaluation } from "@/app/api/jury/evaluations/route";
import { GET as getAdminOverview } from "@/app/api/admin/overview/route";
import { POST as postCalculateResults } from "@/app/api/admin/calculate-results/route";
import { POST as postConfirmPayout } from "@/app/api/admin/payouts/[id]/confirm/route";
import { POST as postTeacherPayout } from "@/app/api/teacher/payouts/route";
import { POST as postPaymentWebhook } from "@/app/api/payments/webhook/route";
import { GET as getCertificateDownload } from "@/app/api/certificates/[applicationId]/download/route";
import { GET as verifyCertificate } from "@/app/api/public/verify-certificate/[token]/route";

describe("Comprehensive Security & RBAC Audit (espressivo ART)", () => {
  const gateway = new MockPaymentGateway();

  // Test users & tokens
  let participantAToken: string;
  let participantBToken: string;
  let teacherToken: string;
  let assignedJuryToken: string;
  let unassignedJuryToken: string;
  let adminToken: string;

  let participantAUser: { id: string; email: string; fullName: string };
  let participantBUser: { id: string; email: string; fullName: string };
  let teacherProfileId: string;

  let testCompetitionId: string;
  let testNominationId: string;
  let testAgeCategoryId: string;

  let applicationAId: string;
  let applicationACode: string;

  beforeAll(async () => {
    // 1. Get competition parameters
    const comp = await prisma.competition.findUnique({
      where: { slug: "espressivo-vocal-2026" },
      include: { nominations: true, ageCategories: true },
    });
    if (!comp) throw new Error("Seeded competition not found");

    testCompetitionId = comp.id;
    testNominationId = comp.nominations[0].id;
    testAgeCategoryId = comp.ageCategories[0].id;

    // 2. Fetch seeded Admin, Teacher, Participant A, Assigned Jury
    const [admin, teacher, participantA, juryA] = await Promise.all([
      prisma.user.findUnique({ where: { email: "admin@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "teacher@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "participant@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "jury@espressivo.art" } }),
    ]);

    if (!admin || !teacher || !participantA || !juryA) {
      throw new Error("Seeded users not found");
    }

    participantAUser = participantA;

    // Fetch teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: teacher.id },
    });
    if (!teacherProfile) throw new Error("Teacher profile not found");
    teacherProfileId = teacherProfile.id;

    // 3. Upsert Participant B (attacker or separate tenant)
    participantBUser = await prisma.user.upsert({
      where: { email: "participant-attacker@espressivo.art" },
      update: {},
      create: {
        email: "participant-attacker@espressivo.art",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
        fullName: "Посторонний Участник",
        role: "PARTICIPANT",
        phone: "+7 (999) 000-00-00",
      },
    });

    // 4. Upsert an Unassigned Jury member
    const unassignedJury = await prisma.user.upsert({
      where: { email: "jury-unassigned@espressivo.art" },
      update: {},
      create: {
        email: "jury-unassigned@espressivo.art",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
        fullName: "Незакрепленный Эксперт",
        role: "JURY",
      },
    });

    // 5. Generate Session Tokens
    adminToken = await createSessionToken({
      userId: admin.id,
      email: admin.email,
      role: "ADMIN",
      fullName: admin.fullName,
    });

    teacherToken = await createSessionToken({
      userId: teacher.id,
      email: teacher.email,
      role: "TEACHER",
      fullName: teacher.fullName,
    });

    participantAToken = await createSessionToken({
      userId: participantA.id,
      email: participantA.email,
      role: "PARTICIPANT",
      fullName: participantA.fullName,
    });

    participantBToken = await createSessionToken({
      userId: participantBUser.id,
      email: participantBUser.email,
      role: "PARTICIPANT",
      fullName: participantBUser.fullName,
    });

    assignedJuryToken = await createSessionToken({
      userId: juryA.id,
      email: juryA.email,
      role: "JURY",
      fullName: juryA.fullName,
    });

    unassignedJuryToken = await createSessionToken({
      userId: unassignedJury.id,
      email: unassignedJury.email,
      role: "JURY",
      fullName: unassignedJury.fullName,
    });

    // 6. Create clean test application belonging to Participant A
    const appA = await prisma.application.create({
      data: {
        code: `EXP-AUDIT-${Date.now().toString().slice(-4)}`,
        userId: participantA.id,
        competitionId: testCompetitionId,
        nominationId: testNominationId,
        ageCategoryId: testAgeCategoryId,
        participantName: "Секретный Ребенок (ПДн)",
        birthDate: new Date("2014-05-12"),
        teacherName: "Учитель Секретный",
        institution: "ДМШ №1 им. Чайковского",
        repertoire: "П. Чайковский — Колыбельная",
        performanceDuration: 180,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        parentFullName: "Родитель Секретный",
        parentEmail: "secret-parent@example.com",
        parentPhone: "+7 (999) 111-22-33",
        consentDataProcess: true,
        consentPublicStream: true,
        status: "UNDER_REVIEW",
        paymentStatus: "PAID",
        referralTeacherId: teacherProfileId,
      },
    });

    applicationAId = appA.id;
    applicationACode = appA.code;

    // Assign only juryA to Application A
    await prisma.evaluation.upsert({
      where: {
        applicationId_juryUserId: {
          applicationId: applicationAId,
          juryUserId: juryA.id,
        },
      },
      update: {
        isDraft: true,
      },
      create: {
        applicationId: applicationAId,
        juryUserId: juryA.id,
        isDraft: true,
      },
    });
  });

  /* ========================================================================
   * 1. PROTECTION OF MINORS & PII (152-ФЗ / GDPR / BLIND AUDITION)
   * ======================================================================== */
  describe("1. Protection of Minors & Personal Data (152-ФЗ)", () => {
    it("should strictly strip child name, parent contacts, school and teacher in GET /api/jury/applications", async () => {
      const req = new Request("http://localhost:3000/api/jury/applications", {
        headers: { authorization: `Bearer ${assignedJuryToken}` },
      });

      const res = await getJuryApplications(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      const item = data.find((a: { applicationId: string }) => a.applicationId === applicationAId);
      expect(item).toBeDefined();

      // Blind audit projection verification
      expect(item.code).toBe(applicationACode);
      expect(item.repertoire).toBe("П. Чайковский — Колыбельная");
      expect(item.videoUrl).toBeDefined();

      // PII must be completely undefined/stripped
      const raw = item as Record<string, unknown>;
      expect(raw.participantName).toBeUndefined();
      expect(raw.birthDate).toBeUndefined();
      expect(raw.parentFullName).toBeUndefined();
      expect(raw.parentEmail).toBeUndefined();
      expect(raw.parentPhone).toBeUndefined();
      expect(raw.teacherName).toBeUndefined();
      expect(raw.institution).toBeUndefined();
    });

    it("should strictly strip minor PII in single application GET /api/applications/[id] for JURY", async () => {
      const req = new Request(`http://localhost:3000/api/applications/${applicationAId}`, {
        headers: { authorization: `Bearer ${assignedJuryToken}` },
      });

      const res = await getApplicationById(req, {
        params: Promise.resolve({ id: applicationAId }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.code).toBe(applicationACode);
      expect(data.repertoire).toBe("П. Чайковский — Колыбельная");
      expect(data.videoUrl).toBeDefined();

      // PII must not leak
      expect(data.participantName).toBeUndefined();
      expect(data.parentFullName).toBeUndefined();
      expect(data.parentEmail).toBeUndefined();
      expect(data.parentPhone).toBeUndefined();
      expect(data.teacherName).toBeUndefined();
      expect(data.institution).toBeUndefined();
    });

    it("should reject application creation when consentDataProcess is missing/false", async () => {
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
          participantName: "Ребенок Без Согласия",
          birthDate: "2015-05-01",
          repertoire: "Этюд",
          videoUrl: "https://youtube.com/watch?v=123",
          parentFullName: "Родитель",
          parentEmail: "rod@example.com",
          parentPhone: "+79991234567",
          consentDataProcess: false, // VIOLATION
          consentPublicStream: true,
        }),
      });

      const res = await postApplication(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("согласие");
    });

    it("should accept application creation when consentPublicStream is false, marking it as restricted", async () => {
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
          participantName: "Ребенок Без Согласия На Видео",
          birthDate: "2018-05-01",
          repertoire: "Этюд",
          videoUrl: "https://youtube.com/watch?v=123",
          parentFullName: "Родитель",
          parentEmail: "rod@example.com",
          parentPhone: "+79991234567",
          consentDataProcess: true,
          consentPublicStream: false,
        }),
      });

      const res = await postApplication(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.application.consentPublicStream).toBe(false);
      expect(body.application.status).toBe("DRAFT");
    });

    it("should not leak minor private contact data or videoUrl in public certificate verification", async () => {
      // Find or create public verified certificate
      const cert = await prisma.certificate.findFirst();
      if (!cert) return;

      const req = new Request(`http://localhost:3000/api/public/verify-certificate/${cert.qrCodeToken}`);
      const res = await verifyCertificate(req, {
        params: Promise.resolve({ token: cert.qrCodeToken }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.isValid).toBe(true);
      expect(body.certificateNumber).toBe(cert.certificateNumber);

      // Must not leak parent contacts or raw video URLs
      expect(body.parentFullName).toBeUndefined();
      expect(body.parentPhone).toBeUndefined();
      expect(body.parentEmail).toBeUndefined();
      expect(body.videoUrl).toBeUndefined();
    });
  });

  /* ========================================================================
   * 2. ROLE-BASED ACCESS CONTROL (RBAC) & CROSS-TENANT ISOLATION
   * ======================================================================== */
  describe("2. RBAC & Cross-Tenant Isolation", () => {
    it("Participant B should be forbidden (403) from accessing Participant A's application", async () => {
      const req = new Request(`http://localhost:3000/api/applications/${applicationAId}`, {
        headers: { authorization: `Bearer ${participantBToken}` },
      });

      const res = await getApplicationById(req, {
        params: Promise.resolve({ id: applicationAId }),
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain("чужой заявке");
    });

    it("should strictly isolate teacher sensitive data (bankDetails, balance, userId) when participant fetches application", async () => {
      const req = new Request(`http://localhost:3000/api/applications/${applicationAId}`, {
        headers: { authorization: `Bearer ${participantAToken}` },
      });

      const res = await getApplicationById(req, {
        params: Promise.resolve({ id: applicationAId }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();

      // Referral teacher must be present with safe public attributes
      expect(data.referralTeacher).toBeDefined();
      expect(data.referralTeacher.id).toBe(teacherProfileId);
      expect(data.referralTeacher.referralCode).toBe("TEACHER-MARIA");

      // Critical sensitive teacher data must NEVER leak
      expect(data.referralTeacher.bankDetails).toBeUndefined();
      expect(data.referralTeacher.balance).toBeUndefined();
      expect(data.referralTeacher.commissionRate).toBeUndefined();
      expect(data.referralTeacher.userId).toBeUndefined();

      // Ensure raw JSON string does not leak teacher's bank details or balance
      const rawJson = JSON.stringify(data);
      expect(rawJson).not.toContain("40802810900000001234");
      expect(rawJson).not.toContain("bankDetails");
    });

    it("Participant B should be forbidden (403) from updating Participant A's application", async () => {
      const req = new Request(`http://localhost:3000/api/applications/${applicationAId}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${participantBToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          repertoire: "Hacked Repertoire",
        }),
      });

      const res = await putApplicationById(req, {
        params: Promise.resolve({ id: applicationAId }),
      });
      expect(res.status).toBe(403);
    });

    it("Participant B should be forbidden (403) from deleting Participant A's application", async () => {
      const req = new Request(`http://localhost:3000/api/applications/${applicationAId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${participantBToken}` },
      });

      const res = await deleteApplicationById(req, {
        params: Promise.resolve({ id: applicationAId }),
      });
      expect(res.status).toBe(403);
    });

    it("Participant should be forbidden (403) from calling admin overview endpoint", async () => {
      const req = new Request("http://localhost:3000/api/admin/overview", {
        headers: { authorization: `Bearer ${participantAToken}` },
      });

      const res = await getAdminOverview(req);
      expect(res.status).toBe(403);
    });

    it("Participant should be forbidden (403) from triggering result calculation", async () => {
      const req = new Request("http://localhost:3000/api/admin/calculate-results", {
        method: "POST",
        headers: { authorization: `Bearer ${participantAToken}` },
      });

      const res = await postCalculateResults(req);
      expect(res.status).toBe(403);
    });

    it("Unauthenticated request should be rejected with 401", async () => {
      const req = new Request("http://localhost:3000/api/admin/overview");
      const res = await getAdminOverview(req);
      expect(res.status).toBe(401);
    });

    it("Unassigned jury member should be forbidden (403) from viewing an application", async () => {
      const req = new Request(`http://localhost:3000/api/applications/${applicationAId}`, {
        headers: { authorization: `Bearer ${unassignedJuryToken}` },
      });

      const res = await getApplicationById(req, {
        params: Promise.resolve({ id: applicationAId }),
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain("не назначена");
    });

    it("refusal of consentPublicStream must NOT block closed jury evaluation", async () => {
      // 1. Create application with consentPublicStream = false
      const nonStreamApp = await prisma.application.create({
        data: {
          code: `EXP-NS-${Date.now().toString().slice(-4)}`,
          userId: participantAUser.id,
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Василий Васильев (Без видео)",
          birthDate: new Date("2015-02-02"),
          repertoire: "Академический вокализ",
          videoUrl: "https://youtube.com/watch?v=private",
          parentFullName: "Василий Васильев",
          parentEmail: "private@test.com",
          parentPhone: "+79997776655",
          consentDataProcess: true,
          consentPublicStream: false, // Refused public streaming
          status: "UNDER_REVIEW",
          paymentStatus: "PAID",
        },
      });

      // 2. Assign jury
      const juryUser = await prisma.user.findUnique({ where: { email: "jury@espressivo.art" } });
      if (!juryUser) throw new Error("Jury not found");

      await prisma.evaluation.create({
        data: {
          applicationId: nonStreamApp.id,
          juryUserId: juryUser.id,
          isDraft: true,
        },
      });

      // 3. Jury member should successfully view application
      const viewReq = new Request(`http://localhost:3000/api/applications/${nonStreamApp.id}`, {
        headers: { authorization: `Bearer ${assignedJuryToken}` },
      });
      const viewRes = await getApplicationById(viewReq, {
        params: Promise.resolve({ id: nonStreamApp.id }),
      });
      expect(viewRes.status).toBe(200);

      // 4. Jury member evaluates application
      const evalReq = new Request("http://localhost:3000/api/jury/evaluations", {
        method: "POST",
        headers: {
          authorization: `Bearer ${assignedJuryToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          applicationId: nonStreamApp.id,
          scoreTechnique: 24,
          scoreMusicality: 23,
          scoreArtistry: 25,
          scoreRepertoire: 24,
          comment: "Прекрасное исполнение и чистота интонации",
          isDraft: false,
        }),
      });

      const evalRes = await postJuryEvaluation(evalReq);
      expect(evalRes.status).toBe(200);
      const evalBody = await evalRes.json();
      expect(evalBody.totalScore).toBe(96);
    });

    it("Unassigned jury member should be forbidden (403) from submitting evaluation", async () => {
      const req = new Request("http://localhost:3000/api/jury/evaluations", {
        method: "POST",
        headers: {
          authorization: `Bearer ${unassignedJuryToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          applicationId: applicationAId,
          scoreTechnique: 20,
          scoreMusicality: 20,
          scoreArtistry: 20,
          scoreRepertoire: 20,
          isFinalSubmit: false,
        }),
      });

      const res = await postJuryEvaluation(req);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toContain("не назначена");
    });

    it("Participant B should be forbidden (403) from downloading Participant A's diploma", async () => {
      const req = new Request(`http://localhost:3000/api/certificates/${applicationAId}/download`, {
        headers: { authorization: `Bearer ${participantBToken}` },
      });

      const res = await getCertificateDownload(req, {
        params: Promise.resolve({ applicationId: applicationAId }),
      });
      expect(res.status).toBe(403);
    });
  });

  /* ========================================================================
   * 3. FINANCIAL INTEGRITY, IDEMPOTENCY & OVERDRAFT PROTECTION
   * ======================================================================== */
  describe("3. Financial Security, Idempotency & Overdraft Protection", () => {
    it("should reject payment webhook with forged signature", async () => {
      const req = new Request("http://localhost:3000/api/payments/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transactionId: "fake_tx_123",
          applicationId: applicationAId,
          amount: 2500,
        currency: "RUB",
        status: "CONFIRMED",
          signature: "forged_signature_bad_hash",
        }),
      });

      const res = await postPaymentWebhook(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("signature");
    });

    it("should reject payment webhook when amount does not match original transaction", async () => {
      const payApp = await prisma.application.create({
        data: {
          code: `EXP-AMT-${Date.now().toString().slice(-4)}`,
          userId: participantAUser.id,
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Фальшивая Оплата Суммы",
          birthDate: new Date("2015-01-01"),
          repertoire: "Конкурсная песня",
          videoUrl: "https://youtube.com/watch?v=amt",
          parentFullName: "Родитель Тестовый",
          parentEmail: "finance-amt@test.com",
          parentPhone: "+79998889901",
          consentDataProcess: true,
          consentPublicStream: true,
          referralTeacherId: teacherProfileId,
          status: "SUBMITTED",
          paymentStatus: "PENDING",
        },
      });

      const paymentSession = await gateway.createPaymentSession({
        applicationId: payApp.id,
        amount: 3000,
        currency: "RUB",
        userId: participantAUser.id,
      });

      const teacherBefore = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
      });
      const balanceBefore = teacherBefore?.balance || 0;

      // Tampered amount: 100 instead of 3000 (even with valid signature for 100)
      const tamperedAmount = 100;
      const tamperedSignature = gateway.generateSignature({
        transactionId: paymentSession.transactionId,
        applicationId: payApp.id,
        amount: tamperedAmount,
        currency: "RUB",
        status: "CONFIRMED",
      });

      const req = new Request("http://localhost:3000/api/payments/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transactionId: paymentSession.transactionId,
          applicationId: payApp.id,
          amount: tamperedAmount,
          currency: "RUB",
          status: "CONFIRMED",
          signature: tamperedSignature,
        }),
      });

      const res = await postPaymentWebhook(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Payment amount mismatch");

      // Transaction must remain PENDING
      const tx = await prisma.paymentTransaction.findUnique({
        where: { transactionId: paymentSession.transactionId },
      });
      expect(tx?.status).toBe("PENDING");

      // Application must remain UNPAID
      const app = await prisma.application.findUnique({
        where: { id: payApp.id },
      });
      expect(app?.paymentStatus).toBe("PENDING");

      // Teacher balance must NOT be altered
      const teacherAfter = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
      });
      expect(teacherAfter?.balance).toBe(balanceBefore);
    });

    it("should reject payment webhook when currency does not match original transaction", async () => {
      const payApp = await prisma.application.create({
        data: {
          code: `EXP-CUR-${Date.now().toString().slice(-4)}`,
          userId: participantAUser.id,
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Фальшивая Оплата Валюты",
          birthDate: new Date("2015-01-01"),
          repertoire: "Конкурсная песня",
          videoUrl: "https://youtube.com/watch?v=cur",
          parentFullName: "Родитель Тестовый",
          parentEmail: "finance-cur@test.com",
          parentPhone: "+79998889902",
          consentDataProcess: true,
          consentPublicStream: true,
          referralTeacherId: teacherProfileId,
          status: "SUBMITTED",
          paymentStatus: "PENDING",
        },
      });

      const paymentSession = await gateway.createPaymentSession({
        applicationId: payApp.id,
        amount: 2500,
        currency: "RUB",
        userId: participantAUser.id,
      });

      const signature = gateway.generateSignature({
        transactionId: paymentSession.transactionId,
        applicationId: payApp.id,
        amount: 2500,
        currency: "USD",
        status: "CONFIRMED",
      });

      // Mismatched currency: USD instead of RUB
      const req = new Request("http://localhost:3000/api/payments/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transactionId: paymentSession.transactionId,
          applicationId: payApp.id,
          amount: 2500,
          currency: "USD",
          status: "CONFIRMED",
          signature,
        }),
      });

      const res = await postPaymentWebhook(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Payment currency mismatch");

      const tx = await prisma.paymentTransaction.findUnique({
        where: { transactionId: paymentSession.transactionId },
      });
      expect(tx?.status).toBe("PENDING");
    });

    it("should enforce exact 20% teacher commission and anti-replay idempotency", async () => {
      // 1. Create a dedicated application for payment audit
      const payApp = await prisma.application.create({
        data: {
          code: `EXP-SEC-${Date.now().toString().slice(-4)}`,
          userId: participantAUser.id,
          competitionId: testCompetitionId,
          nominationId: testNominationId,
          ageCategoryId: testAgeCategoryId,
          participantName: "Финансовый Ученик",
          birthDate: new Date("2015-01-01"),
          repertoire: "Финансовый Вокал",
          videoUrl: "https://youtube.com/watch?v=sec",
          parentFullName: "Родитель Финанс",
          parentEmail: "finance@test.com",
          parentPhone: "+79998889900",
          consentDataProcess: true,
          consentPublicStream: true,
          referralTeacherId: teacherProfileId,
          status: "SUBMITTED",
          paymentStatus: "PENDING",
        },
      });

      const paymentSession = await gateway.createPaymentSession({
        applicationId: payApp.id,
        amount: 3000,
        userId: participantAUser.id,
      });

      const teacherBefore = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
      });
      const balanceBefore = teacherBefore?.balance || 0;

      const signature = gateway.generateSignature({
        transactionId: paymentSession.transactionId,
        applicationId: payApp.id,
        amount: 3000,
        currency: "RUB",
        status: "CONFIRMED",
      });

      // 2. Deliver first webhook
      const req1 = new Request("http://localhost:3000/api/payments/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transactionId: paymentSession.transactionId,
          applicationId: payApp.id,
          amount: 3000,
        currency: "RUB",
        status: "CONFIRMED",
          signature,
        }),
      });

      const res1 = await postPaymentWebhook(req1);
      expect(res1.status).toBe(200);
      const body1 = await res1.json();
      expect(body1.status).toBe("PROCESSED");

      // Verify exact 20% commission: 3000 * 0.20 = 600
      const teacherAfter1 = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
      });
      expect(teacherAfter1?.balance).toBe(balanceBefore + 600);

      // 3. Replay EXACT same webhook (network duplicate delivery)
      const req2 = new Request("http://localhost:3000/api/payments/webhook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transactionId: paymentSession.transactionId,
          applicationId: payApp.id,
          amount: 3000,
        currency: "RUB",
        status: "CONFIRMED",
          signature,
        }),
      });

      const res2 = await postPaymentWebhook(req2);
      expect(res2.status).toBe(200);
      const body2 = await res2.json();
      expect(body2.status).toBe("ALREADY_PROCESSED");

      // Balance MUST NOT increment on replay!
      const teacherAfter2 = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
      });
      expect(teacherAfter2?.balance).toBe(balanceBefore + 600);
    });

    it("should reject teacher payout request that exceeds available balance", async () => {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
      });
      const currentBalance = teacherProfile?.balance || 0;
      const excessiveAmount = currentBalance + 500000;

      const req = new Request("http://localhost:3000/api/teacher/payouts", {
        method: "POST",
        headers: {
          authorization: `Bearer ${teacherToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          amount: excessiveAmount,
          bankDetails: "ИНН 7701234567, СБП +79998887766",
        }),
      });

      const res = await postTeacherPayout(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Недостаточно средств");
    });

    it("should reject teacher payout request below minimum threshold (1000 RUB)", async () => {
      const req = new Request("http://localhost:3000/api/teacher/payouts", {
        method: "POST",
        headers: {
          authorization: `Bearer ${teacherToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          amount: 500, // below 1000 RUB threshold
          bankDetails: "ИНН 7701234567, СБП +79998887766",
        }),
      });

      const res = await postTeacherPayout(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("1 000");
    });

    it("should atomically deduct balance and block duplicate payout confirmations", async () => {
      // 1. Ensure teacher has at least 1500 balance
      await prisma.teacherProfile.update({
        where: { id: teacherProfileId },
        data: { balance: { increment: 2000 } },
      });

      const teacherBefore = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
      });
      const balBefore = teacherBefore?.balance || 0;

      // 2. Request 1000 RUB payout
      const payoutReq = new Request("http://localhost:3000/api/teacher/payouts", {
        method: "POST",
        headers: {
          authorization: `Bearer ${teacherToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          amount: 1000,
          bankDetails: "ИНН 7701234567, СБП +79990001122 (Тинькофф)",
        }),
      });

      const payoutRes = await postTeacherPayout(payoutReq);
      expect(payoutRes.status).toBe(201);
      const payoutData = await payoutRes.json();
      const payoutId = payoutData.payoutRequest.id;

      // 3. Balance must be decremented immediately by 1000
      const teacherAfterReq = await prisma.teacherProfile.findUnique({
        where: { id: teacherProfileId },
      });
      expect(teacherAfterReq?.balance).toBe(balBefore - 1000);

      // 4. Admin confirms payout
      const adminConfirmReq = new Request(`http://localhost:3000/api/admin/payouts/${payoutId}/confirm`, {
        method: "POST",
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const confirmRes = await postConfirmPayout(adminConfirmReq, {
        params: Promise.resolve({ id: payoutId }),
      });
      expect(confirmRes.status).toBe(200);

      // 5. Duplicate confirmation attempt MUST be rejected
      const dupConfirmReq = new Request(`http://localhost:3000/api/admin/payouts/${payoutId}/confirm`, {
        method: "POST",
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const dupRes = await postConfirmPayout(dupConfirmReq, {
        params: Promise.resolve({ id: payoutId }),
      });
      expect(dupRes.status).toBe(400);
      const dupBody = await dupRes.json();
      expect(dupBody.error).toContain("уже подтверждена");
    });
  });
});
