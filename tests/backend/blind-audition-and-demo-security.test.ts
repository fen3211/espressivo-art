import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { POST as postLogin } from "@/app/api/auth/login/route";
import { GET as getJuryAppById } from "@/app/api/jury/applications/[id]/route";
import { GET as getJuryAudio } from "@/app/api/jury/applications/[id]/audio/route";
import { GET as getAppById } from "@/app/api/applications/[id]/route";

describe("Security Hardening: Demo Accounts & Server-Side Blind Audition Invariants", () => {
  let adminToken: string;
  let assignedJuryToken: string;
  let unassignedJuryToken: string;
  let participantToken: string;
  let teacherToken: string;

  let testApplicationId: string;
  const rawTestVideoUrl = "https://www.youtube.com/watch?v=blind_eval_target_42";

  beforeAll(async () => {
    // 1. Fetch or create users
    const [admin, teacher, participant, jury] = await Promise.all([
      prisma.user.findUnique({ where: { email: "admin@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "teacher@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "participant@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "jury@espressivo.art" } }),
    ]);

    if (!admin || !teacher || !participant || !jury) {
      throw new Error("Seeded users not found");
    }

    adminToken = await createSessionToken({
      userId: admin.id,
      email: admin.email,
      role: "ADMIN",
      fullName: admin.fullName,
    });

    assignedJuryToken = await createSessionToken({
      userId: jury.id,
      email: jury.email,
      role: "JURY",
      fullName: jury.fullName,
    });

    unassignedJuryToken = await createSessionToken({
      userId: "unassigned_jury_sec_test",
      email: "unassigned.jury.sec@example.com",
      role: "JURY",
      fullName: "Неназначенный Эксперт",
    });

    participantToken = await createSessionToken({
      userId: participant.id,
      email: participant.email,
      role: "PARTICIPANT",
      fullName: participant.fullName,
    });

    teacherToken = await createSessionToken({
      userId: teacher.id,
      email: teacher.email,
      role: "TEACHER",
      fullName: teacher.fullName,
    });

    // 2. Fetch competition
    const comp = await prisma.competition.findUnique({
      where: { slug: "espressivo-vocal-2026" },
      include: { nominations: true, ageCategories: true },
    });
    if (!comp) throw new Error("Competition not found");

    // 3. Create test application with private raw video URL
    const app = await prisma.application.create({
      data: {
        code: `EXP-BLIND-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        userId: participant.id,
        competitionId: comp.id,
        nominationId: comp.nominations[0].id,
        ageCategoryId: comp.ageCategories[0].id,
        participantName: "Защищенный Участник",
        birthDate: new Date("2013-08-20"),
        repertoire: "И. С. Бах — Ария",
        videoUrl: rawTestVideoUrl,
        videoProvider: "YOUTUBE",
        parentFullName: "Родитель Защищенный",
        parentEmail: "guardian.sec@example.com",
        parentPhone: "+79001234567",
        consentDataProcess: true,
        status: "UNDER_REVIEW",
        paymentStatus: "PAID",
      },
    });
    testApplicationId = app.id;

    // 4. Assign jury member
    await prisma.evaluation.create({
      data: {
        applicationId: app.id,
        juryUserId: jury.id,
        isDraft: true,
      },
    });
  });

  /* ========================================================================
   * 1. DEMO ACCOUNTS PRODUCTION INVARIANTS (ASVS 2.1.8, 2.1.9)
   * ======================================================================== */
  describe("1. Demo Accounts Strict Production Isolation", () => {
    it("should unconditionally forbid demo accounts in NODE_ENV=production, ignoring any override variables", async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalDemoEnable = process.env.ENABLE_DEMO_ACCOUNTS;

      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
        // Attempt bypass with override variable: must be strictly ignored!
        process.env.ENABLE_DEMO_ACCOUNTS = "true";

        const demoEmails = [
          "participant@espressivo.art",
          "teacher@espressivo.art",
          "jury@espressivo.art",
          "admin@espressivo.art",
        ];

        for (const email of demoEmails) {
          const req = new Request("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email,
              password: "password123", // Correct or incorrect seeded password
            }),
          });

          const res = await postLogin(req);

          // Must return standard 401 INVALID_CREDENTIALS, never 403 or DEMO_ACCOUNTS_DISABLED
          expect(res.status).toBe(401);
          const body = await res.json();
          expect(body.code).toBe("INVALID_CREDENTIALS");
          expect(body.code).not.toBe("DEMO_ACCOUNTS_DISABLED");
          expect(body.error).toBe("Неверный логин или пароль");
        }
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
        process.env.ENABLE_DEMO_ACCOUNTS = originalDemoEnable;
      }
    });

    it("should not leak user existence via response timing or distinct error codes for nonexistent vs demo users", async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";

        // Demo user request
        const demoReq = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: "admin@espressivo.art",
            password: "ArbitraryPassword!99",
          }),
        });

        // Nonexistent user request
        const randomReq = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: "completely-nonexistent-user-xyz@example.com",
            password: "ArbitraryPassword!99",
          }),
        });

        const [demoRes, randomRes] = await Promise.all([
          postLogin(demoReq),
          postLogin(randomReq),
        ]);

        expect(demoRes.status).toBe(401);
        expect(randomRes.status).toBe(401);

        const demoBody = await demoRes.json();
        const randomBody = await randomRes.json();

        // Error message and code must be completely indistinguishable
        expect(demoBody).toEqual(randomBody);
        expect(demoBody.code).toBe("INVALID_CREDENTIALS");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
      }
    });
  });

  /* ========================================================================
   * 2. SERVER-SIDE BLIND AUDITION ENFORCEMENT & ZERO RAW VIDEO LEAKAGE
   * ======================================================================== */
  describe("2. Server-Side Blind Audition Invariants & Stream Isolation", () => {
    it("GET /api/jury/applications/[id] must NEVER return raw video URL to JURY", async () => {
      const req = new Request(`http://localhost:3000/api/jury/applications/${testApplicationId}`, {
        headers: { authorization: `Bearer ${assignedJuryToken}` },
      });

      const res = await getJuryAppById(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      // 1. Raw video URL MUST be null
      expect(data.videoUrl).toBeNull();

      // 2. Audio stream representation MUST be returned
      expect(data.audioUrl).toBe(`/api/jury/applications/${testApplicationId}/audio`);
      expect(data.audioRepresentation).toBeDefined();
      expect(data.audioRepresentation.type).toBe("AUDIO_ONLY");
      expect(data.audioRepresentation.isBlindMode).toBe(true);

      // 3. Flags enforce blind audition
      expect(data.isBlindModeEnforced).toBe(true);
      expect(data.isBlindModeDefault).toBe(true);

      // 4. Zero PII
      expect(data.participantName).toBeUndefined();
      expect(data.parentFullName).toBeUndefined();
    });

    it("GET /api/jury/applications/[id] allows ADMIN authorized full video view", async () => {
      const req = new Request(`http://localhost:3000/api/jury/applications/${testApplicationId}`, {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const res = await getJuryAppById(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      // Admin gets raw videoUrl for moderation
      expect(data.videoUrl).toBe(rawTestVideoUrl);
      expect(data.isBlindModeEnforced).toBe(false);
    });

    it("GET /api/applications/[id] must NEVER return raw video URL to JURY", async () => {
      const req = new Request(`http://localhost:3000/api/applications/${testApplicationId}`, {
        headers: { authorization: `Bearer ${assignedJuryToken}` },
      });

      const res = await getAppById(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.videoUrl).toBeNull();
      expect(data.audioUrl).toBe(`/api/jury/applications/${testApplicationId}/audio`);
      expect(data.isBlindModeEnforced).toBe(true);
    });

    it("GET /api/jury/applications/[id]/audio allows assigned jury expert", async () => {
      const req = new Request(`http://localhost:3000/api/jury/applications/${testApplicationId}/audio`, {
        headers: { authorization: `Bearer ${assignedJuryToken}` },
      });

      const res = await getJuryAudio(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.mediaType).toBe("AUDIO_ONLY");
      expect(data.isBlindModeEnforced).toBe(true);
      expect(data.applicationId).toBe(testApplicationId);
    });

    it("GET /api/jury/applications/[id]/audio forbids unassigned jury member (403)", async () => {
      const req = new Request(`http://localhost:3000/api/jury/applications/${testApplicationId}/audio`, {
        headers: { authorization: `Bearer ${unassignedJuryToken}` },
      });

      const res = await getJuryAudio(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.code).toBe("NOT_ASSIGNED");
    });

    it("GET /api/jury/applications/[id]/audio forbids participant role (403)", async () => {
      const req = new Request(`http://localhost:3000/api/jury/applications/${testApplicationId}/audio`, {
        headers: { authorization: `Bearer ${participantToken}` },
      });

      const res = await getJuryAudio(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.code).toBe("FORBIDDEN");
    });

    it("GET /api/jury/applications/[id]/audio rejects unauthenticated requests (401)", async () => {
      const req = new Request(`http://localhost:3000/api/jury/applications/${testApplicationId}/audio`);

      const res = await getJuryAudio(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe("UNAUTHORIZED");
    });
  });
});
