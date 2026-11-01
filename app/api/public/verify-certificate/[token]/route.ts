import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  props: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await props.params;

    if (!token) {
      return NextResponse.json({ isValid: false, message: "Токен не указан" }, { status: 400 });
    }

    // Lookup certificate by qrCodeToken or certificateNumber
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ qrCodeToken: token }, { certificateNumber: token }],
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { isValid: false, message: "Сертификат не найден в реестре espressivo ART" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isValid: true,
      certificateNumber: certificate.certificateNumber,
      participantName: certificate.participantName,
      competitionTitle: certificate.competitionTitle,
      nominationTitle: certificate.nominationTitle,
      awardDegree: certificate.awardDegree,
      totalScore: certificate.totalScore,
      issuedDate: certificate.issuedDate.toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Verify certificate error:", error);
    return NextResponse.json({ isValid: false, message: "Ошибка верификации сертификата" }, { status: 500 });
  }
}
