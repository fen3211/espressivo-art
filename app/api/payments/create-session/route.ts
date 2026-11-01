import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { paymentGateway } from "@/lib/payment-gateway";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "Не указан applicationId" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        competition: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && application.userId !== session.userId) {
      return NextResponse.json({ error: "Доступ к оплате чужой заявки запрещен" }, { status: 403 });
    }

    if (application.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Заявка уже оплачена" }, { status: 400 });
    }

    const sessionResult = await paymentGateway.createPaymentSession({
      applicationId: application.id,
      amount: application.competition.entryFee,
      userId: session.userId,
      currency: application.competition.currency,
      description: `Оргвзнос: ${application.competition.titleRu} (${application.code})`,
    });

    return NextResponse.json(sessionResult);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Create payment session error:", error);
    return NextResponse.json({ error: "Ошибка создания платежной сессии" }, { status: 500 });
  }
}
