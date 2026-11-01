import PDFDocument from "pdfkit";
import fs from "fs";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export interface CertificatePdfData {
  certificateNumber: string;
  participantName: string;
  competitionTitle: string;
  nominationTitle: string;
  awardDegree: string;
  totalScore: number;
  issuedDate: Date | string;
  qrCodeToken: string;
  teacherName?: string | null;
}

const AWARD_DEGREE_LABELS: Record<string, { ru: string; en: string }> = {
  GRAND_PRIX: { ru: "ГРАН-ПРИ", en: "GRAND PRIX" },
  LAUREATE_1: { ru: "ЛАУРЕАТ I СТЕПЕНИ", en: "LAUREATE 1ST DEGREE" },
  LAUREATE_2: { ru: "ЛАУРЕАТ II СТЕПЕНИ", en: "LAUREATE 2ND DEGREE" },
  LAUREATE_3: { ru: "ЛАУРЕАТ III СТЕПЕНИ", en: "LAUREATE 3RD DEGREE" },
  DIPLOMANT: { ru: "ДИПЛОМАНТ", en: "DIPLOMA HOLDER" },
  PARTICIPANT: { ru: "СЕРТИФИКАТ УЧАСТНИКА", en: "CERTIFICATE OF PARTICIPATION" },
};

/**
 * Generates an elegant, museum-grade PDF diploma adhering to the Art+Commerce aesthetic.
 */
export async function generateCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Landscape A4: 841.89 x 595.28 points
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 36, bottom: 36, left: 40, right: 40 },
      info: {
        Title: `Diploma — ${data.participantName}`,
        Author: "espressivo ART International Platform",
        Subject: `${data.competitionTitle} — ${data.awardDegree}`,
        Keywords: "Diploma, Certificate, Music, Art, espressivo",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err: Error) => reject(err));

    // Register Cyrillic Serif fonts if available on host OS
    const fontRegular = fs.existsSync("C:/Windows/Fonts/times.ttf") ? "C:/Windows/Fonts/times.ttf" : "Times-Roman";
    const fontBold = fs.existsSync("C:/Windows/Fonts/timesbd.ttf") ? "C:/Windows/Fonts/timesbd.ttf" : "Times-Bold";
    const fontItalic = fs.existsSync("C:/Windows/Fonts/timesi.ttf") ? "C:/Windows/Fonts/timesi.ttf" : "Times-Italic";

    const width = 841.89;
    const height = 595.28;

    // 1. Warm bone paper background (#FAF8F5)
    doc.rect(0, 0, width, height).fill("#FAF8F5");

    // 2. Double editorial border
    // Outer border (thin charcoal)
    doc.rect(24, 24, width - 48, height - 48)
      .lineWidth(1)
      .strokeColor("#1A1A1A")
      .stroke();

    // Inner border (gold/bronze accent #A38344)
    doc.rect(30, 30, width - 60, height - 60)
      .lineWidth(0.75)
      .strokeColor("#A38344")
      .stroke();

    // Corner decorative corner accents
    const cornerSize = 12;
    doc.rect(26, 26, cornerSize, cornerSize).fill("#A38344");
    doc.rect(width - 26 - cornerSize, 26, cornerSize, cornerSize).fill("#A38344");
    doc.rect(26, height - 26 - cornerSize, cornerSize, cornerSize).fill("#A38344");
    doc.rect(width - 26 - cornerSize, height - 26 - cornerSize, cornerSize, cornerSize).fill("#A38344");

    // 3. Header: Cultural Authority
    doc.font(fontRegular)
      .fontSize(10)
      .fillColor("#666666")
      .text("ESPRESSIVO ART  ·  INTERNATIONAL CREATIVE COMPETITIONS", 0, 56, {
        align: "center",
        characterSpacing: 2,
      });

    doc.font(fontRegular)
      .fontSize(9)
      .fillColor("#888888")
      .text("ACADEMY OF VOCAL & PERFORMING ARTS REGISTER", 0, 72, {
        align: "center",
        characterSpacing: 1.5,
      });

    // Decorative divider line
    doc.moveTo(width / 2 - 120, 92)
      .lineTo(width / 2 + 120, 92)
      .lineWidth(0.5)
      .strokeColor("#A38344")
      .stroke();

    // 4. Award Degree Section
    const degreeInfo = AWARD_DEGREE_LABELS[data.awardDegree] || {
      ru: data.awardDegree,
      en: data.awardDegree,
    };

    doc.font(fontBold)
      .fontSize(16)
      .fillColor("#A38344")
      .text("ДИПЛОМ  /  DIPLOMA", 0, 110, {
        align: "center",
        characterSpacing: 3,
      });

    doc.font(fontBold)
      .fontSize(28)
      .fillColor("#111111")
      .text(degreeInfo.ru, 0, 138, {
        align: "center",
        characterSpacing: 1.5,
      });

    doc.font(fontItalic)
      .fontSize(12)
      .fillColor("#555555")
      .text(degreeInfo.en, 0, 172, {
        align: "center",
        characterSpacing: 1,
      });

    // 5. Awarded to Participant
    doc.font(fontRegular)
      .fontSize(11)
      .fillColor("#666666")
      .text("Награждается / Awarded to", 0, 208, {
        align: "center",
      });

    doc.font(fontBold)
      .fontSize(32)
      .fillColor("#111111")
      .text(data.participantName, 0, 228, {
        align: "center",
      });

    // Subtle underline under name
    doc.moveTo(width / 2 - 180, 272)
      .lineTo(width / 2 + 180, 272)
      .lineWidth(0.5)
      .strokeColor("#CCCCCC")
      .stroke();

    // 6. Competition & Nomination
    doc.font(fontRegular)
      .fontSize(13)
      .fillColor("#222222")
      .text(data.competitionTitle, 0, 288, {
        align: "center",
      });

    doc.font(fontItalic)
      .fontSize(12)
      .fillColor("#555555")
      .text(`Номинация / Nomination: ${data.nominationTitle}`, 0, 310, {
        align: "center",
      });

    if (data.teacherName) {
      doc.font(fontRegular)
        .fontSize(11)
        .fillColor("#444444")
        .text(`Преподаватель / Mentor: ${data.teacherName}`, 0, 332, {
          align: "center",
        });
    }

    // 7. Score display
    doc.font(fontBold)
      .fontSize(11)
      .fillColor("#A38344")
      .text(`Итоговый результат / Score: ${data.totalScore.toFixed(1)} / 100`, 0, 360, {
        align: "center",
      });

    // 8. Signatures & Verification Row (Bottom section)
    const bottomY = 430;

    // Left block: Contest Directorate
    doc.font(fontBold)
      .fontSize(9)
      .fillColor("#333333")
      .text("ОРГКОМИТЕТ КОНКУРСА", 70, bottomY);
    doc.font(fontItalic)
      .fontSize(8)
      .fillColor("#777777")
      .text("Organizing Committee Board", 70, bottomY + 12);
    doc.moveTo(70, bottomY + 45)
      .lineTo(240, bottomY + 45)
      .lineWidth(0.5)
      .strokeColor("#999999")
      .stroke();
    doc.font(fontRegular)
      .fontSize(8)
      .fillColor("#555555")
      .text("espressivo Artistic Director", 70, bottomY + 50);

    // Center block: Verification Seal & QR info
    doc.font(fontBold)
      .fontSize(8)
      .fillColor("#A38344")
      .text("ОФИЦИАЛЬНАЯ ВЕРИФИКАЦИЯ", width / 2 - 100, bottomY, { width: 200, align: "center" });
    doc.font(fontRegular)
      .fontSize(8)
      .fillColor("#555555")
      .text(`Номер: ${data.certificateNumber}`, width / 2 - 100, bottomY + 14, { width: 200, align: "center" });
    doc.font(fontRegular)
      .fontSize(7.5)
      .fillColor("#777777")
      .text(`Токен верификации: ${data.qrCodeToken.substring(0, 16)}...`, width / 2 - 100, bottomY + 28, { width: 200, align: "center" });
    doc.font(fontItalic)
      .fontSize(7.5)
      .fillColor("#888888")
      .text(`Проверить: espressivo.art/verify/${data.qrCodeToken}`, width / 2 - 100, bottomY + 42, { width: 200, align: "center" });

    // Right block: International Jury Board
    doc.font(fontBold)
      .fontSize(9)
      .fillColor("#333333")
      .text("МЕЖДУНАРОДНОЕ ЖЮРИ", width - 240, bottomY);
    doc.font(fontItalic)
      .fontSize(8)
      .fillColor("#777777")
      .text("International Adjudication Board", width - 240, bottomY + 12);
    doc.moveTo(width - 240, bottomY + 45)
      .lineTo(width - 70, bottomY + 45)
      .lineWidth(0.5)
      .strokeColor("#999999")
      .stroke();
    doc.font(fontRegular)
      .fontSize(8)
      .fillColor("#555555")
      .text("Chair of Adjudication Panel", width - 240, bottomY + 50);

    // 9. Footer date & imprint
    const formattedDate = new Date(data.issuedDate).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    doc.font(fontRegular)
      .fontSize(8)
      .fillColor("#999999")
      .text(`Дата выдачи: ${formattedDate}  ·  Geneva — Vienna — Moscow  ·  espressivo ART Platform`, 0, height - 42, {
        align: "center",
      });

    doc.end();
  });
}

/**
 * Finds or creates a Certificate in the database for a completed application.
 */
export async function getOrCreateCertificateForApplication(applicationId: string) {
  // Check if certificate already exists
  const existing = await prisma.certificate.findUnique({
    where: { applicationId },
    include: {
      application: {
        include: {
          competition: true,
          nomination: true,
        },
      },
    },
  });

  if (existing) {
    return existing;
  }

  // Fetch application with evaluations
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      competition: true,
      nomination: true,
      evaluations: true,
    },
  });

  if (!application) {
    throw new Error(`Application ${applicationId} not found`);
  }

  // Calculate score from evaluations
  const finalizedEvaluations = application.evaluations.filter((e) => !e.isDraft);
  let averageScore = 0;
  if (finalizedEvaluations.length > 0) {
    const sum = finalizedEvaluations.reduce((acc, curr) => acc + curr.totalScore, 0);
    averageScore = Math.round((sum / finalizedEvaluations.length) * 10) / 10;
  }

  // Determine award degree based on score bracket
  let awardDegree = "PARTICIPANT";
  if (averageScore >= 98) {
    awardDegree = "GRAND_PRIX";
  } else if (averageScore >= 90) {
    awardDegree = "LAUREATE_1";
  } else if (averageScore >= 80) {
    awardDegree = "LAUREATE_2";
  } else if (averageScore >= 70) {
    awardDegree = "LAUREATE_3";
  } else if (averageScore >= 60) {
    awardDegree = "DIPLOMANT";
  }

  const certificateNumber = `ESP-VOC-2026-${application.code.split("-").pop() || "0001"}-${awardDegree.substring(0, 4)}`;
  const qrCodeToken = crypto.randomBytes(16).toString("hex");

  const certificate = await prisma.certificate.create({
    data: {
      certificateNumber,
      applicationId: application.id,
      participantName: application.participantName,
      competitionTitle: application.competition.titleRu,
      nominationTitle: application.nomination.titleRu,
      awardDegree,
      totalScore: averageScore,
      qrCodeToken,
    },
    include: {
      application: {
        include: {
          competition: true,
          nomination: true,
        },
      },
    },
  });

  return certificate;
}
