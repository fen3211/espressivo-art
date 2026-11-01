import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { GET as meHandler } from "@/app/api/auth/me/route";
import { GET as getPublicCompetitions } from "@/app/api/public/competitions/route";
import { GET as getPublicCompetitionBySlug } from "@/app/api/public/competitions/[slug]/route";
import { GET as getApplications, POST as postApplication } from "@/app/api/applications/route";
import { GET as getTeacherDashboard } from "@/app/api/teacher/dashboard/route";
import { GET as getTeacherPayouts, POST as postTeacherPayout } from "@/app/api/teacher/payouts/route";
import { GET as getAdminOverview } from "@/app/api/admin/overview/route";
import { GET as getAdminUsers } from "@/app/api/admin/users/route";
import { GET as getAdminCompetitions } from "@/app/api/admin/competitions/route";
import { GET as getAdminApplications } from "@/app/api/admin/applications/route";
import { POST as assignJuryHandler } from "@/app/api/admin/applications/[id]/assign-jury/route";
import { POST as calculateResultsHandler } from "@/app/api/admin/calculate-results/route";
import { POST as confirmPayoutHandler } from "@/app/api/admin/payouts/[id]/confirm/route";
import { createSessionToken } from "@/lib/auth";

describe("Comprehensive API Routes Integration Suite", () => {
  let adminToken: string;
  let teacherToken: string;
  let participantToken: string;
  let juryToken: string;
  let testCompetitionId: string;
  let testNominationId: string;
  let testAgeCategoryId: string;

  beforeAll(async () => {
    // Lookup seeded users
    const [admin, teacher, participant, jury, comp] = await Promise.all([
      prisma.user.findUnique({ where: { email: "admin@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "teacher@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "participant@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "jury@espressivo.art" } }),
      prisma.competition.findUnique({
        where: { slug: "espressivo-vocal-2026" },
        include: { nominations: true, ageCategories: true },
      }),
    ]);

    if (!admin || !teacher || !participant || !jury || !comp) {
      throw new Error("Seeded test data incomplete");
    }

    testCompetitionId = comp.id;
    testNominationId = comp.nominations[0].id;
    testAgeCategoryId = comp.ageCategories[0].id;

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

    participantToken = await createSessionToken({
      userId: participant.id,
      email: participant.email,
      role: "PARTICIPANT",
      fullName: participant.fullName,
    });

    juryToken = await createSessionToken({
      userId: jury.id,
      email: jury.email,
      role: "JURY",
      fullName: jury.fullName,
    });
  });

  // 1. Auth routes
  it("POST /api/auth/register should create new teacher with auto-generated referral code", async () => {
    const uniqueEmail = `teacher_${Date.now()}@test.art`;
    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: "securePassword123",
        fullName: "Ольга Сергеевна Романова",
        role: "TEACHER",
        organization: "Музыкальная академия",
      }),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe(uniqueEmail);
    expect(body.user.role).toBe("TEACHER");
    expect(body.user.referralCode).toBeDefined();
    expect(body.user.referralCode).toContain("TEACHER-");
  });

  it("POST /api/auth/login should authenticate valid user and return role-based redirect", async () => {
    const req = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "admin@espressivo.art",
        password: "pass1234",
      }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.role).toBe("ADMIN");
    expect(body.redirectUrl).toBe("/admin");
  });

  it("POST /api/auth/logout should clear cookie", async () => {
    const res = await logoutHandler();
    expect(res.status).toBe(200);
    const cookieHeader = res.headers.get("set-cookie");
    expect(cookieHeader).toContain("token=");
    expect(cookieHeader).toContain("Max-Age=0");
  });

  it("GET /api/auth/me should return authenticated user details", async () => {
    const req = new Request("http://localhost:3000/api/auth/me", {
      headers: { authorization: `Bearer ${teacherToken}` },
    });
    const res = await meHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).not.toBeNull();
    expect(body.user.role).toBe("TEACHER");
    expect(body.user.teacherProfile.referralCode).toBe("TEACHER-MARIA");
  });

  // 2. Public routes
  it("GET /api/public/competitions should return competition catalog", async () => {
    const res = await getPublicCompetitions();
    expect(res.status).toBe(200);
    const list = await res.json();
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((c: { slug: string }) => c.slug === "espressivo-vocal-2026")).toBe(true);
  });

  it("GET /api/public/competitions/[slug] should return full details and jury panel", async () => {
    const req = new Request("http://localhost:3000/api/public/competitions/espressivo-vocal-2026");
    const res = await getPublicCompetitionBySlug(req, {
      params: Promise.resolve({ slug: "espressivo-vocal-2026" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe("espressivo-vocal-2026");
    expect(body.nominations.length).toBe(4);
    expect(body.ageCategories.length).toBe(4);
    expect(body.jury.length).toBeGreaterThan(0);
  });

  // 3. Application creation & validation
  it("POST /api/applications should reject without parental consent", async () => {
    const req = new Request("http://localhost:3000/api/applications", {
      method: "POST",
      headers: {
        authorization: `Bearer ${participantToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        competitionId: testCompetitionId,
        nominationId: testNominationId,
        ageCategoryId: testAgeCategoryId,
        participantName: "Тест",
        birthDate: "2015-01-01",
        repertoire: "Тест",
        videoUrl: "https://youtube.com/test",
        parentFullName: "Родитель",
        parentEmail: "p@p.com",
        parentPhone: "123",
        consentDataProcess: false, // REJECT
      }),
    });

    const res = await postApplication(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("согласие");
  });

  it("POST /api/applications should successfully create new draft application", async () => {
    const req = new Request("http://localhost:3000/api/applications", {
      method: "POST",
      headers: {
        authorization: `Bearer ${participantToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        competitionId: testCompetitionId,
        nominationId: testNominationId,
        ageCategoryId: testAgeCategoryId,
        participantName: "Вероника Семенова",
        birthDate: "2013-09-14",
        repertoire: "Ф. Шуберт — Форель",
        performanceDuration: 140,
        videoUrl: "https://www.youtube.com/watch?v=schubert",
        parentFullName: "Анна Семенова",
        parentEmail: "semenova@example.com",
        parentPhone: "+7 (999) 765-43-21",
        consentDataProcess: true,
        consentPublicStream: true,
        referralCode: "TEACHER-MARIA",
        isSubmit: false,
      }),
    });

    const res = await postApplication(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.application.code).toMatch(/^EXP-2026-\d{4}$/);
    expect(body.application.status).toBe("DRAFT");
    expect(body.application.referralTeacherId).toBeDefined();
  });

  // 4. Teacher dashboard & payouts
  it("GET /api/teacher/dashboard should return financial summary and participants", async () => {
    const req = new Request("http://localhost:3000/api/teacher/dashboard", {
      headers: { authorization: `Bearer ${teacherToken}` },
    });

    const res = await getTeacherDashboard(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.referralCode).toBe("TEACHER-MARIA");
    expect(body.commissionRate).toBe(0.20);
    expect(body.balance).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.participants)).toBe(true);
    expect(Array.isArray(body.recentTransactions)).toBe(true);
  });

  it("POST /api/teacher/payouts should reject if amount exceeds balance", async () => {
    const req = new Request("http://localhost:3000/api/teacher/payouts", {
      method: "POST",
      headers: {
        authorization: `Bearer ${teacherToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: 9999999, // Exceeds balance
        bankDetails: "ИНН 7701234567, СБП +79992223344",
      }),
    });

    const res = await postTeacherPayout(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Недостаточно средств");
  });

  it("POST /api/teacher/payouts should create payout request when balance is sufficient", async () => {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { referralCode: "TEACHER-MARIA" },
    });
    if (!teacher || teacher.balance < 1000) {
      await prisma.teacherProfile.update({
        where: { referralCode: "TEACHER-MARIA" },
        data: { balance: 5000 },
      });
    }

    const req = new Request("http://localhost:3000/api/teacher/payouts", {
      method: "POST",
      headers: {
        authorization: `Bearer ${teacherToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        amount: 1000,
        bankDetails: "ИНН 7701234567, СБП +79992223344 (Тинькофф)",
      }),
    });

    const res = await postTeacherPayout(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.payoutRequest.amount).toBe(1000);
    expect(body.payoutRequest.status).toBe("REQUESTED");
  });

  // 5. Admin endpoints
  it("GET /api/admin/overview should return comprehensive platform metrics", async () => {
    const req = new Request("http://localhost:3000/api/admin/overview", {
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const res = await getAdminOverview(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.users.total).toBeGreaterThan(0);
    expect(body.applications.total).toBeGreaterThan(0);
    expect(body.finance.totalRevenue).toBeGreaterThanOrEqual(0);
  });

  it("POST /api/admin/applications/[id]/assign-jury should assign jury expert", async () => {
    const juryUser = await prisma.user.findUnique({
      where: { email: "jury@espressivo.art" },
    });
    const app = await prisma.application.findFirst({
      where: { code: "EXP-2026-1003" },
    });
    if (!juryUser || !app) throw new Error("TestData not found");

    const req = new Request(`http://localhost:3000/api/admin/applications/${app.id}/assign-jury`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        juryUserId: juryUser.id,
      }),
    });

    const res = await assignJuryHandler(req, {
      params: Promise.resolve({ id: app.id }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.assignedCount).toBe(1);
  });

  it("POST /api/admin/calculate-results should calculate awards and issue certificates", async () => {
    const req = new Request("http://localhost:3000/api/admin/calculate-results", {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        competitionId: testCompetitionId,
      }),
    });

    const res = await calculateResultsHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.certificatesIssuedCount).toBeGreaterThanOrEqual(1);
  });

  it("POST /api/admin/payouts/[id]/confirm should confirm teacher payout request", async () => {
    const payout = await prisma.payoutRequest.findFirst({
      where: { status: "REQUESTED" },
    });
    if (!payout) return;

    const req = new Request(`http://localhost:3000/api/admin/payouts/${payout.id}/confirm`, {
      method: "POST",
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const res = await confirmPayoutHandler(req, {
      params: Promise.resolve({ id: payout.id }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.payoutRequest.status).toBe("COMPLETED");
  });
});
