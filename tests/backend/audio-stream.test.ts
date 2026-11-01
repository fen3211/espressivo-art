import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { GET as getAudioStream, HEAD as headAudioStream } from "@/app/api/jury/applications/[id]/audio/stream/route";
import { GET as getAudioMeta } from "@/app/api/jury/applications/[id]/audio/route";

describe("Audio Streaming & Blind Audition Endpoint (/api/jury/applications/[id]/audio/stream)", () => {
  let adminToken: string;
  let assignedJuryToken: string;
  let unassignedJuryToken: string;
  let participantToken: string;
  let teacherToken: string;

  let testApplicationId: string;
  let unassignedApplicationId: string;
  let audioFileSize: number;

  beforeAll(async () => {
    // 1. Verify bundled classical vocal sample exists
    const mp3Path = path.join(process.cwd(), "assets", "audio", "classical-vocal-aria.mp3");
    expect(fs.existsSync(mp3Path)).toBe(true);
    const stat = fs.statSync(mp3Path);
    audioFileSize = stat.size;
    expect(audioFileSize).toBeGreaterThan(10000); // Realistic sample > 10KB

    // 2. Fetch seeded users
    const [admin, teacher, participant, jury] = await Promise.all([
      prisma.user.findUnique({ where: { email: "admin@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "teacher@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "participant@espressivo.art" } }),
      prisma.user.findUnique({ where: { email: "jury@espressivo.art" } }),
    ]);

    if (!admin || !teacher || !participant || !jury) {
      throw new Error("Seeded test users not found in database");
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
      userId: "unassigned_jury_stream_test",
      email: "unassigned.jury.stream@example.com",
      role: "JURY",
      fullName: "Неназначенный Жюри",
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

    // 3. Fetch competition
    const comp = await prisma.competition.findUnique({
      where: { slug: "espressivo-vocal-2026" },
      include: { nominations: true, ageCategories: true },
    });
    if (!comp) throw new Error("Competition not found");

    // 4. Create test applications
    // A: Assigned application
    const appAssigned = await prisma.application.create({
      data: {
        code: `EXP-AUDIO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        userId: participant.id,
        competitionId: comp.id,
        nominationId: comp.nominations[0].id,
        ageCategoryId: comp.ageCategories[0].id,
        participantName: "Вокальный Кандидат",
        birthDate: new Date("2012-05-14"),
        repertoire: "Г. Ф. Гендель — Ария 'Lascia ch'io pianga'",
        videoUrl: "https://www.youtube.com/watch?v=sample_aria_video_42",
        videoProvider: "YOUTUBE",
        parentFullName: "Родитель Кандидата",
        parentEmail: "parent.candidate@example.com",
        parentPhone: "+79008887766",
        consentDataProcess: true,
        status: "UNDER_REVIEW",
        paymentStatus: "PAID",
      },
    });
    testApplicationId = appAssigned.id;

    // Assign jury member to appAssigned
    await prisma.evaluation.create({
      data: {
        applicationId: appAssigned.id,
        juryUserId: jury.id,
        isDraft: true,
      },
    });

    // B: Unassigned application (no evaluation row for jury)
    const appUnassigned = await prisma.application.create({
      data: {
        code: `EXP-UNASS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        userId: participant.id,
        competitionId: comp.id,
        nominationId: comp.nominations[0].id,
        ageCategoryId: comp.ageCategories[0].id,
        participantName: "Другой Участник",
        birthDate: new Date("2011-03-10"),
        repertoire: "В. А. Моцарт — Ария Керубино",
        videoUrl: "https://www.youtube.com/watch?v=sample_cherubino_99",
        videoProvider: "YOUTUBE",
        parentFullName: "Родитель Другой",
        parentEmail: "parent.other@example.com",
        parentPhone: "+79001112233",
        consentDataProcess: true,
        status: "UNDER_REVIEW",
        paymentStatus: "PAID",
      },
    });
    unassignedApplicationId = appUnassigned.id;
  });

  describe("1. Metadata Endpoint Consistency", () => {
    it("GET /api/jury/applications/[id]/audio should point to the stream route", async () => {
      const req = new Request(`http://localhost:3000/api/jury/applications/${testApplicationId}/audio`, {
        headers: { authorization: `Bearer ${assignedJuryToken}` },
      });

      const res = await getAudioMeta(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.mediaType).toBe("AUDIO_ONLY");
      expect(data.streamUrl).toBe(`/api/jury/applications/${testApplicationId}/audio/stream`);
      expect(data.isBlindModeEnforced).toBe(true);
    });
  });

  describe("2. Authentication and Authorization Guards", () => {
    it("should reject unauthenticated request with 401 UNAUTHORIZED", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe("UNAUTHORIZED");
    });

    it("should reject PARTICIPANT role with 403 FORBIDDEN", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          headers: { authorization: `Bearer ${participantToken}` },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.code).toBe("FORBIDDEN");
    });

    it("should reject TEACHER role with 403 FORBIDDEN", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          headers: { authorization: `Bearer ${teacherToken}` },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.code).toBe("FORBIDDEN");
    });

    it("should reject unassigned JURY expert with 403 NOT_ASSIGNED", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${unassignedApplicationId}/audio/stream`,
        {
          headers: { authorization: `Bearer ${assignedJuryToken}` }, // assigned to appA, NOT appB
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: unassignedApplicationId }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.code).toBe("NOT_ASSIGNED");
    });

    it("should reject unassigned JURY token on assigned app with 403 NOT_ASSIGNED", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          headers: { authorization: `Bearer ${unassignedJuryToken}` },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.code).toBe("NOT_ASSIGNED");
    });

    it("should return 404 NOT_FOUND for non-existent application", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/non_existent_app_id/audio/stream`,
        {
          headers: { authorization: `Bearer ${assignedJuryToken}` },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: "non_existent_app_id" }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.code).toBe("NOT_FOUND");
    });
  });

  describe("3. Full Audio Streaming (200 OK)", () => {
    it("should stream entire audio file when Range header is not present", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          headers: { authorization: `Bearer ${assignedJuryToken}` },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/^audio\/(mpeg|wav)$/);
      expect(res.headers.get("accept-ranges")).toBe("bytes");
      expect(res.headers.get("content-length")).toBe(String(audioFileSize));
      expect(res.headers.get("cache-control")).toContain("private");

      const bodyBuffer = await res.arrayBuffer();
      expect(bodyBuffer.byteLength).toBe(audioFileSize);
    });

    it("should allow ADMIN to stream audio even without an explicit evaluation assignment", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${unassignedApplicationId}/audio/stream`,
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: unassignedApplicationId }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/^audio\/(mpeg|wav)$/);
      expect(res.headers.get("content-length")).toBe(String(audioFileSize));
    });

    it("should authenticate via ?token= URL query parameter for browser audio tag compatibility", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream?token=${assignedJuryToken}`
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/^audio\/(mpeg|wav)$/);
      const bodyBuffer = await res.arrayBuffer();
      expect(bodyBuffer.byteLength).toBe(audioFileSize);
    });
  });

  describe("4. HTTP Range Requests & Partial Content (206 Partial Content)", () => {
    it("should return 206 Partial Content for standard start-end range (bytes=0-1023)", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          headers: {
            authorization: `Bearer ${assignedJuryToken}`,
            range: "bytes=0-1023",
          },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(206);
      expect(res.headers.get("content-type")).toMatch(/^audio\/(mpeg|wav)$/);
      expect(res.headers.get("accept-ranges")).toBe("bytes");
      expect(res.headers.get("content-range")).toBe(`bytes 0-1023/${audioFileSize}`);
      expect(res.headers.get("content-length")).toBe("1024");

      const bodyBuffer = await res.arrayBuffer();
      expect(bodyBuffer.byteLength).toBe(1024);
    });

    it("should return 206 Partial Content for open-ended range (bytes=2048-)", async () => {
      const start = 2048;
      const expectedLength = audioFileSize - start;

      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          headers: {
            authorization: `Bearer ${assignedJuryToken}`,
            range: `bytes=${start}-`,
          },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(206);
      expect(res.headers.get("content-range")).toBe(`bytes ${start}-${audioFileSize - 1}/${audioFileSize}`);
      expect(res.headers.get("content-length")).toBe(String(expectedLength));

      const bodyBuffer = await res.arrayBuffer();
      expect(bodyBuffer.byteLength).toBe(expectedLength);
    });

    it("should return 206 Partial Content for suffix byte range (bytes=-512)", async () => {
      const suffixLength = 512;
      const expectedStart = audioFileSize - suffixLength;

      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          headers: {
            authorization: `Bearer ${assignedJuryToken}`,
            range: `bytes=-${suffixLength}`,
          },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(206);
      expect(res.headers.get("content-range")).toBe(`bytes ${expectedStart}-${audioFileSize - 1}/${audioFileSize}`);
      expect(res.headers.get("content-length")).toBe(String(suffixLength));

      const bodyBuffer = await res.arrayBuffer();
      expect(bodyBuffer.byteLength).toBe(suffixLength);
    });

    it("should return 416 Range Not Satisfiable when start exceeds file size", async () => {
      const invalidStart = audioFileSize + 10000;

      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          headers: {
            authorization: `Bearer ${assignedJuryToken}`,
            range: `bytes=${invalidStart}-${invalidStart + 500}`,
          },
        }
      );

      const res = await getAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(416);
      expect(res.headers.get("content-range")).toBe(`bytes */${audioFileSize}`);
      expect(res.headers.get("accept-ranges")).toBe("bytes");
    });
  });

  describe("5. HTTP HEAD Requests (Browser Pre-flight Probing)", () => {
    it("should return 200 with headers and empty body for HEAD requests without range", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          method: "HEAD",
          headers: { authorization: `Bearer ${assignedJuryToken}` },
        }
      );

      const res = await headAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/^audio\/(mpeg|wav)$/);
      expect(res.headers.get("accept-ranges")).toBe("bytes");
      expect(res.headers.get("content-length")).toBe(String(audioFileSize));

      const text = await res.text();
      expect(text).toBe("");
    });

    it("should return 206 with headers and empty body for HEAD requests with range", async () => {
      const req = new Request(
        `http://localhost:3000/api/jury/applications/${testApplicationId}/audio/stream`,
        {
          method: "HEAD",
          headers: {
            authorization: `Bearer ${assignedJuryToken}`,
            range: "bytes=0-100",
          },
        }
      );

      const res = await headAudioStream(req, {
        params: Promise.resolve({ id: testApplicationId }),
      });

      expect(res.status).toBe(206);
      expect(res.headers.get("content-range")).toBe(`bytes 0-100/${audioFileSize}`);
      expect(res.headers.get("content-length")).toBe("101");

      const text = await res.text();
      expect(text).toBe("");
    });
  });
});
