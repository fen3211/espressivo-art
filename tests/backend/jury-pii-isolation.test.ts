import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import { GET as getJuryApplications } from "@/app/api/jury/applications/route";
import { POST as postJuryEvaluation } from "@/app/api/jury/evaluations/route";
import { createSessionToken } from "@/lib/auth";

describe("Jury Adjudication & Minor PII Isolation (Blind Audition)", () => {
  let juryUserId: string;
  let juryToken: string;
  let testAppId: string;

  beforeAll(async () => {
    const jury = await prisma.user.findUnique({
      where: { email: "jury@espressivo.art" },
    });
    if (!jury) throw new Error("Jury test user not found");

    juryUserId = jury.id;
    juryToken = await createSessionToken({
      userId: jury.id,
      email: jury.email,
      role: "JURY",
      fullName: jury.fullName,
    });

    // Find seeded application under review (EXP-2026-1004)
    const app = await prisma.application.findUnique({
      where: { code: "EXP-2026-1004" },
    });
    if (!app) throw new Error("Seeded application EXP-2026-1004 not found");
    testAppId = app.id;
  });

  it("should isolate minor PII from jury applications list (Blind Audition)", async () => {
    const req = new Request("http://localhost:3000/api/jury/applications", {
      headers: {
        authorization: `Bearer ${juryToken}`,
      },
    });

    const response = await getJuryApplications(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    const appItem = data.find((a: { code: string }) => a.code === "EXP-2026-1004");
    expect(appItem).toBeDefined();

    // 1. Permitted evaluation fields MUST be present
    expect(appItem.code).toBe("EXP-2026-1004");
    expect(appItem.nominationTitle).toBeDefined();
    expect(appItem.ageCategoryTitle).toBeDefined();
    expect(appItem.repertoire).toBeDefined();
    expect(appItem.videoUrl).toBeDefined();

    // 2. Minor PII MUST BE STRICTLY STRIPPED
    expect((appItem as Record<string, unknown>).participantName).toBeUndefined();
    expect((appItem as Record<string, unknown>).parentFullName).toBeUndefined();
    expect((appItem as Record<string, unknown>).parentEmail).toBeUndefined();
    expect((appItem as Record<string, unknown>).parentPhone).toBeUndefined();
    expect((appItem as Record<string, unknown>).birthDate).toBeUndefined();
    expect((appItem as Record<string, unknown>).teacherName).toBeUndefined();
    expect((appItem as Record<string, unknown>).institution).toBeUndefined();
  });

  it("should validate scoring criteria bounds (0-25 each)", async () => {
    const invalidReq = new Request("http://localhost:3000/api/jury/evaluations", {
      method: "POST",
      headers: {
        authorization: `Bearer ${juryToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        applicationId: testAppId,
        scoreTechnique: 30, // Exceeds 25!
        scoreMusicality: 20,
        scoreArtistry: 20,
        scoreRepertoire: 20,
        isFinalSubmit: false,
      }),
    });

    const response = await postJuryEvaluation(invalidReq);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toContain("25");
  });

  it("should save draft evaluation and then lock upon final submit", async () => {
    // Reset evaluation to draft state for clean isolated test execution
    await prisma.evaluation.upsert({
      where: {
        applicationId_juryUserId: {
          applicationId: testAppId,
          juryUserId,
        },
      },
      update: {
        isDraft: true,
        submittedAt: null,
      },
      create: {
        applicationId: testAppId,
        juryUserId,
        isDraft: true,
      },
    });

    // 1. Save draft
    const draftReq = new Request("http://localhost:3000/api/jury/evaluations", {
      method: "POST",
      headers: {
        authorization: `Bearer ${juryToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        applicationId: testAppId,
        scoreTechnique: 24,
        scoreMusicality: 23,
        scoreArtistry: 24,
        scoreRepertoire: 23,
        comment: "Черновик отзыва: великолепное интонирование",
        isFinalSubmit: false,
      }),
    });

    const draftRes = await postJuryEvaluation(draftReq);
    expect(draftRes.status).toBe(200);
    const draftData = await draftRes.json();
    expect(draftData.totalScore).toBe(94);
    expect(draftData.isLocked).toBe(false);

    // 2. Final Submit (lock)
    const finalReq = new Request("http://localhost:3000/api/jury/evaluations", {
      method: "POST",
      headers: {
        authorization: `Bearer ${juryToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        applicationId: testAppId,
        scoreTechnique: 24,
        scoreMusicality: 24,
        scoreArtistry: 24,
        scoreRepertoire: 24,
        comment: "Финальная оценка: безупречная техника и зрелое исполнение",
        isFinalSubmit: true,
      }),
    });

    const finalRes = await postJuryEvaluation(finalReq);
    expect(finalRes.status).toBe(200);
    const finalData = await finalRes.json();
    expect(finalData.totalScore).toBe(96);
    expect(finalData.isLocked).toBe(true);

    // 3. Attempt modification after lock -> MUST return 403
    const lockedReq = new Request("http://localhost:3000/api/jury/evaluations", {
      method: "POST",
      headers: {
        authorization: `Bearer ${juryToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        applicationId: testAppId,
        scoreTechnique: 20,
        scoreMusicality: 20,
        scoreArtistry: 20,
        scoreRepertoire: 20,
        comment: "Попытка изменить зафиксированную оценку",
        isFinalSubmit: false,
      }),
    });

    const lockedRes = await postJuryEvaluation(lockedReq);
    expect(lockedRes.status).toBe(403);
    const lockedData = await lockedRes.json();
    expect(lockedData.error).toContain("заблокирована");
  });
});
