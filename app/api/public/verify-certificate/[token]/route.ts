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
            consentPublicStream: true,
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

    // 152-FZ (Art. 10.1) & 149-FZ MINOR PRIVACY BY DESIGN:
    // Differentiate mandatory internal processing consent (Art. 9) from voluntary separate
    // consent for public dissemination (Art. 10.1 of 152-FZ).
    // By default (or when consentPublicStream is false), unauthenticated public verification
    // ONLY confirms authenticity and minimal non-PII credential data:
    // (certificateNumber, competitionTitle, nominationTitle, awardDegree, issuedDate).
    // Disclosing totalScore and minor's name (even masked) is strictly forbidden unless
    // explicit separate public dissemination consent (consentPublicStream === true) is granted.
    const hasPublicDisseminationConsent = Boolean(certificate.application?.consentPublicStream);

    return NextResponse.json({
      isValid: true,
      certificateNumber: certificate.certificateNumber,
      competitionTitle: certificate.competitionTitle,
      nominationTitle: certificate.nominationTitle,
      awardDegree: certificate.awardDegree,
      issuedDate: certificate.issuedDate.toISOString(),
      privacyProtected: true,
      publicConsentGranted: hasPublicDisseminationConsent,
      ...(hasPublicDisseminationConsent
        ? {
            participantNameMasked: maskMinorName(certificate.participantName),
            totalScore: certificate.totalScore,
          }
        : {}),
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
