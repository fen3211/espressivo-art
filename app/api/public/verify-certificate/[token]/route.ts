import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Mask minor contestant name according to 152-FZ and GDPR Art. 8 data minimization requirements.
 * Example: "Алиса Морозова" -> "Алиса М." or "А. М."
 */
function maskMinorName(fullName: string): string {
  if (!fullName) return "Участник конкурса";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return `${parts[0].slice(0, 1)}***`;
  }
  return `${parts[0]} ${parts[1].slice(0, 1)}.`;
}

export async function GET(
  _req: Request,
  props: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await props.params;

    if (!token || typeof token !== "string" || token.length < 16) {
      return NextResponse.json(
        { isValid: false, message: "Некорректный токен верификации", code: "INVALID_TOKEN" },
        { status: 400 }
      );
    }

    // Lookup certificate exclusively by cryptographically secure qrCodeToken.
    // Sequential certificate numbers are strictly forbidden for public unauthenticated lookup
    // to prevent enumeration / harvesting of minor records.
    const certificate = await prisma.certificate.findUnique({
      where: { qrCodeToken: token },
      include: {
        application: {
          select: {
            status: true,
          },
        },
      },
    });

    // Check existence and active status (reject revoked/rejected entries)
    if (!certificate || certificate.application?.status === "REJECTED") {
      return NextResponse.json(
        {
          isValid: false,
          message: "Сертификат не найден в официальном реестре espressivo ART или был отозван",
          code: "CERTIFICATE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // MINOR PRIVACY & DATA MINIMIZATION:
    // Only return non-sensitive authenticity confirmation:
    // Valid status, certificate number, masked name, competition, nomination, degree, and issue date.
    // Absolute exclusion of guardian contacts, emails, phones, user IDs, and raw internal DB records.
    return NextResponse.json({
      isValid: true,
      certificateNumber: certificate.certificateNumber,
      participantNameMasked: maskMinorName(certificate.participantName),
      competitionTitle: certificate.competitionTitle,
      nominationTitle: certificate.nominationTitle,
      awardDegree: certificate.awardDegree,
      totalScore: certificate.totalScore,
      issuedDate: certificate.issuedDate.toISOString(),
      privacyProtected: true,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Verify certificate error:", error);
    return NextResponse.json(
      { isValid: false, message: "Ошибка верификации сертификата", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
