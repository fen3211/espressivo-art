import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateCertificatePdf, getOrCreateCertificateForApplication } from "@/lib/certificates";

export async function GET(
  req: Request,
  props: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const { applicationId } = await props.params;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        competition: true,
        nomination: true,
        certificate: true,
        referralTeacher: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    // Access check: Participant owner, Teacher, or Admin
    const isOwner = application.userId === session.userId;
    const isTeacher = application.referralTeacher?.userId === session.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isOwner && !isTeacher && !isAdmin) {
      return NextResponse.json({ error: "Доступ к диплому ограничен" }, { status: 403 });
    }

    // Get or generate certificate record
    let certificate = application.certificate;
    if (!certificate) {
      try {
        certificate = await getOrCreateCertificateForApplication(application.id);
      } catch {
        return NextResponse.json(
          { error: "Диплом еще не сформирован (оценки жюри в процессе обработки)" },
          { status: 400 }
        );
      }
    }

    // Generate high-resolution PDF
    const pdfBuffer = await generateCertificatePdf({
      certificateNumber: certificate.certificateNumber,
      participantName: certificate.participantName,
      competitionTitle: certificate.competitionTitle,
      nominationTitle: certificate.nominationTitle,
      awardDegree: certificate.awardDegree,
      totalScore: certificate.totalScore,
      issuedDate: certificate.issuedDate,
      qrCodeToken: certificate.qrCodeToken,
      teacherName: application.teacherName,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="espressivo-diploma-${certificate.certificateNumber}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Certificate download error:", error);
    return NextResponse.json({ error: "Ошибка при формировании PDF-диплома" }, { status: 500 });
  }
}
