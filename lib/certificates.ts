import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
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
 * Resolves bundled Open Source (SIL OFL) NotoSerif fonts included in the repository.
 * Zero reliance on host Windows/Linux system paths; 100% portable across Windows, Docker, and Linux CI.
 */
function getBundledFontPaths() {
  const baseDir = path.join(process.cwd(), "assets", "fonts");
  const regular = path.join(baseDir, "NotoSerif.ttf");
  const italic = path.join(baseDir, "NotoSerif-Italic.ttf");

  return {
    regular: fs.existsSync(regular) ? regular : null,
    italic: fs.existsSync(italic) ? italic : null,
  };
}

/**
 * Generates an elegant, museum-grade PDF diploma adhering to the Art+Commerce aesthetic.
 * Embeds a real verified QR-code with true Cyrillic typography via bundled SIL OFL fonts.
 * No transliteration; cross-platform determinism on Windows, Linux, and container environments.
 */
export async function generateCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  // Canonical public verification URL encoded in the physical QR code
  const verifyUrl = `${appUrl}/verify/${data.qrCodeToken}`;

  // 1. Generate real QR code buffer as high-density PNG
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    type: "png",
    width: 280, // high density resolution for 70pt PDF image
    margin: 1,
    color: {
      dark: "#1A1A1A",
      light: "#FAF8F5",
    },
  });

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

    // Register bundled fonts
    const fonts = getBundledFontPaths();
    if (fonts.regular) {
      doc.registerFont("NotoSerif", fonts.regular);
      doc.registerFont("NotoSerif-Bold", fonts.regular);
    }
    if (fonts.italic) {
      doc.registerFont("NotoSerif-Italic", fonts.italic);
    }

    const fontRegular = fonts.regular ? "NotoSerif" : "Times-Roman";
    const fontBold = fonts.regular ? "NotoSerif-Bold" : "Times-Bold";
    const fontItalic = fonts.italic ? "NotoSerif-Italic" : "Times-Italic";

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

    // Corner decorative accents
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
      .text("Награждается / Awarded to", 0, 206, {
        align: "center",
      });

    doc.font(fontBold)
      .fontSize(30)
      .fillColor("#111111")
      .text(data.participantName, 0, 226, {
        align: "center",
      });

    // Subtle underline under name
    doc.moveTo(width / 2 - 180, 270)
      .lineTo(width / 2 + 180, 270)
      .lineWidth(0.5)
      .strokeColor("#CCCCCC")
      .stroke();

    // 6. Competition & Nomination
    doc.font(fontRegular)
      .fontSize(13)
      .fillColor("#222222")
      .text(data.competitionTitle, 0, 286, {
        align: "center",
      });

    doc.font(fontItalic)
      .fontSize(12)
      .fillColor("#555555")
      .text(`Номинация / Nomination: ${data.nominationTitle}`, 0, 308, {
        align: "center",
      });

    if (data.teacherName) {
      doc.font(fontRegular)
        .fontSize(11)
        .fillColor("#444444")
        .text(`Преподаватель / Mentor: ${data.teacherName}`, 0, 330, {
          align: "center",
        });
    }

    // 7. Score display
    doc.font(fontBold)
      .fontSize(11)
      .fillColor("#A38344")
      .text(`Итоговый результат / Score: ${data.totalScore.toFixed(1)} / 100`, 0, 356, {
        align: "center",
      });

    // 8. Signatures & Verification Row (Bottom section)
    const bottomY = 415;

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

    // Center block: Verification Seal & Real Embedded QR Code (width: 70)
    const qrWidth = 70;
    const qrX = Math.round(width / 2 - qrWidth / 2);
    const qrY = bottomY + 20;

    doc.font(fontBold)
      .fontSize(8)
      .fillColor("#A38344")
      .text("ОФИЦИАЛЬНАЯ ВЕРИФИКАЦИЯ", width / 2 - 100, bottomY - 2, { width: 200, align: "center" });

    doc.font(fontRegular)
      .fontSize(7.5)
      .fillColor("#555555")
      .text(`Номер: ${data.certificateNumber}`, width / 2 - 100, bottomY + 10, { width: 200, align: "center" });

    // Embed real QR code image
    doc.image(qrBuffer, qrX, qrY, { width: 70 });

    doc.font(fontRegular)
      .fontSize(7)
      .fillColor("#777777")
      .text(`Токен: ${data.qrCodeToken.substring(0, 16)}...`, width / 2 - 100, qrY + 73, { width: 200, align: "center" });

    doc.font(fontItalic)
      .fontSize(7)
      .fillColor("#888888")
      .text(`espressivo.art/verify`, width / 2 - 100, qrY + 84, { width: 200, align: "center" });

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
      .text(`Дата выдачи: ${formattedDate}  ·  Geneva — Vienna — Moscow  ·  espressivo ART Platform`, 0, height - 32, {
        align: "center",
      });

    doc.end();
  });
}

/**
 * Finds or creates a Certificate in the database for an evaluated application.
 * Generates a high-entropy 256-bit cryptographic token (64 hex chars).
 */
export async function getOrCreateCertificateForApplication(applicationId: string) {
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

  const compYear = (application.competition.startDate ? new Date(application.competition.startDate) : new Date()).getFullYear();
  const certificateNumber = `ESP-VOC-${compYear}-${application.code.split("-").pop() || "0001"}-${awardDegree.substring(0, 4)}`;
  // 256-bit cryptographic randomness (64 hex characters) to eliminate enumeration
  const qrCodeToken = crypto.randomBytes(32).toString("hex");

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
