import { NextResponse } from "next/server";
import { paymentGateway } from "@/lib/payment-gateway";

export async function POST(req: Request) {
  try {
    const signatureHeader = req.headers.get("x-signature") || undefined;
    const payload = await req.json();

    const { transactionId, applicationId, amount, status, signature } = payload;

    if (!transactionId || !applicationId || amount === undefined || !status) {
      return NextResponse.json(
        { error: "Неполные данные вебхука (требуются transactionId, applicationId, amount, status)" },
        { status: 400 }
      );
    }

    const result = await paymentGateway.processWebhook(
      {
        transactionId,
        applicationId,
        amount: Number(amount),
        status,
        signature: signature || signatureHeader || "",
      },
      signatureHeader
    );

    if (!result.received && result.status === "FAILED") {
      return NextResponse.json({ error: result.message || "Ошибка обработки вебхука" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Payment webhook error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка обработки вебхука" }, { status: 500 });
  }
}
