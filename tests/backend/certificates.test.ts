import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import { generateCertificatePdf } from "@/lib/certificates";
import { GET as verifyCertificateHandler } from "@/app/api/public/verify-certificate/[token]/route";
import { GET as downloadCertificateHandler } from "@/app/api/certificates/[applicationId]/download/route";
import { createSessionToken } from "@/lib/auth";

describe("Certificates & High-Print Diploma Module", () => {
  let participantToken: string;
  let testAppId: string;
  const validToken = "cert_token_voronova_2026";

  beforeAll(async () => {
    const participant = await prisma.user.findUnique({
      where: { email: "participant@espressivo.art" },
    });
    if (!participant) throw new Error("Seeded participant not found");

    participantToken = await createSessionToken({
      userId: participant.id,
      email: participant.email,
      role: "PARTICIPANT",
      fullName: participant.fullName,
    });

    const cert = await prisma.certificate.findUnique({
      where: { qrCodeToken: validToken },
      include: { application: true },
    });
    if (!cert) throw new Error("Seeded certificate not found");
    testAppId = cert.applicationId;
  });

  it("should generate a valid PDF diploma buffer conforming to Art+Commerce specs", async () => {
    const buffer = await generateCertificatePdf({
      certificateNumber: "ESP-VOC-2026-TEST-L1",
      participantName: "Екатерина Воронова",
      competitionTitle: "espressivo VOCAL — Young Talents",
      nominationTitle: "Академический вокал (Соло)",
      awardDegree: "LAUREATE_1",
      totalScore: 96.5,
      issuedDate: new Date(),
      qrCodeToken: "test_qr_token_hex_12345",
      teacherName: "Смирнова М.А.",
    });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);

    // Verify PDF header magic bytes %PDF-
    const header = buffer.subarray(0, 5).toString("ascii");
    expect(header).toBe("%PDF-");
  });

  it("should verify genuine certificate via public verification route", async () => {
    const req = new Request(`http://localhost:3000/api/public/verify-certificate/${validToken}`);
    const res = await verifyCertificateHandler(req, {
      params: Promise.resolve({ token: validToken }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isValid).toBe(true);
    expect(data.participantName).toBe("Екатерина Воронова");
    expect(data.awardDegree).toBe("LAUREATE_1");
    expect(data.totalScore).toBe(96);
    expect(data.certificateNumber).toContain("ESP-VOC-2026-1005-");
  });

  it("should return 404 for unknown or forged certificate tokens", async () => {
    const fakeToken = "forged_non_existent_token_999999";
    const req = new Request(`http://localhost:3000/api/public/verify-certificate/${fakeToken}`);
    const res = await verifyCertificateHandler(req, {
      params: Promise.resolve({ token: fakeToken }),
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.isValid).toBe(false);
  });

  it("should download PDF certificate with correct headers for authorized owner", async () => {
    const req = new Request(`http://localhost:3000/api/certificates/${testAppId}/download`, {
      headers: {
        authorization: `Bearer ${participantToken}`,
      },
    });

    const res = await downloadCertificateHandler(req, {
      params: Promise.resolve({ applicationId: testAppId }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain("attachment; filename=");
    expect(res.headers.get("Content-Disposition")).toContain("ESP-VOC-2026-1005-");

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    expect(buffer.subarray(0, 5).toString("ascii")).toBe("%PDF-");
  });
});
