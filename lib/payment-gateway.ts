import crypto from "crypto";
import prisma from "@/lib/prisma";

export interface PaymentSessionParams {
  applicationId: string;
  amount: number;
  userId: string;
  currency?: string;
  description?: string;
  returnUrl?: string;
}

export interface PaymentSessionResult {
  paymentUrl: string;
  transactionId: string;
}

export interface WebhookPayload {
  transactionId: string;
  applicationId: string;
  amount: number;
  status: "CONFIRMED" | "FAILED";
  signature: string;
}

export interface WebhookResult {
  received: boolean;
  status: "PROCESSED" | "ALREADY_PROCESSED" | "FAILED";
  message?: string;
}

export interface PaymentGatewayInterface {
  createPaymentSession(params: PaymentSessionParams): Promise<PaymentSessionResult>;
  verifySignature(payload: { transactionId: string; applicationId: string; amount: number; status: string }, signature: string): boolean;
  processWebhook(payload: WebhookPayload, signatureHeader?: string): Promise<WebhookResult>;
}

export class MockPaymentGateway implements PaymentGatewayInterface {
  private secret: string;

  constructor() {
    this.secret = process.env.MOCK_PAYMENT_SECRET || "mock-payment-secret-espressivo-art-2026";
  }

  /**
   * Generates HMAC-SHA256 signature for a payload.
   */
  public generateSignature(data: {
    transactionId: string;
    applicationId: string;
    amount: number;
    status: string;
  }): string {
    const raw = `${data.transactionId}:${data.applicationId}:${data.amount}:${data.status}`;
    return crypto.createHmac("sha256", this.secret).update(raw).digest("hex");
  }

  /**
   * Verifies an incoming HMAC-SHA256 signature.
   */
  public verifySignature(
    data: { transactionId: string; applicationId: string; amount: number; status: string },
    signature: string
  ): boolean {
    if (!signature) return false;
    const expected = this.generateSignature(data);
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  /**
   * Creates a mock payment session and initial PENDING transaction record.
   */
  public async createPaymentSession(params: PaymentSessionParams): Promise<PaymentSessionResult> {
    const transactionId = `mock_tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const currency = params.currency || "RUB";

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: params.applicationId },
    });

    if (!application) {
      throw new Error(`Application ${params.applicationId} not found`);
    }

    // Create payment transaction record in DB
    await prisma.paymentTransaction.create({
      data: {
        transactionId,
        applicationId: params.applicationId,
        userId: params.userId,
        amount: params.amount,
        currency,
        status: "PENDING",
        provider: "MOCK",
        rawPayload: JSON.stringify({
          description: params.description ?? `Entry fee for application ${application.code}`,
          returnUrl: params.returnUrl,
        }),
      },
    });

    // Update application payment status to PENDING
    await prisma.application.update({
      where: { id: params.applicationId },
      data: { paymentStatus: "PENDING" },
    });

    const paymentUrl = `/checkout/mock?tx=${transactionId}&appId=${params.applicationId}`;

    return {
      paymentUrl,
      transactionId,
    };
  }

  /**
   * Idempotent webhook processing with anti-replay protection and 20% teacher commission accrual.
   */
  public async processWebhook(
    payload: WebhookPayload,
    signatureHeader?: string
  ): Promise<WebhookResult> {
    const signature = signatureHeader || payload.signature;

    // 1. Verify signature
    const isValidSignature = this.verifySignature(
      {
        transactionId: payload.transactionId,
        applicationId: payload.applicationId,
        amount: payload.amount,
        status: payload.status,
      },
      signature
    );

    if (!isValidSignature) {
      return {
        received: false,
        status: "FAILED",
        message: "Invalid webhook signature",
      };
    }

    // 2. Fetch existing transaction
    const existingTx = await prisma.paymentTransaction.findUnique({
      where: { transactionId: payload.transactionId },
      include: {
        application: {
          include: {
            competition: true,
            referralTeacher: true,
          },
        },
      },
    });

    if (!existingTx) {
      return {
        received: false,
        status: "FAILED",
        message: `Transaction ${payload.transactionId} not found`,
      };
    }

    // 3. IDEMPOTENCY CHECK: If already confirmed, do NOT double-process
    if (existingTx.status === "CONFIRMED") {
      return {
        received: true,
        status: "ALREADY_PROCESSED",
        message: "Transaction has already been processed and confirmed",
      };
    }

    // 4. Atomic transaction processing
    if (payload.status === "CONFIRMED") {
      await prisma.$transaction(async (tx) => {
        // Mark payment transaction as confirmed
        await tx.paymentTransaction.update({
          where: { id: existingTx.id },
          data: {
            status: "CONFIRMED",
            updatedAt: new Date(),
          },
        });

        // Mark application as PAID
        await tx.application.update({
          where: { id: existingTx.applicationId },
          data: {
            paymentStatus: "PAID",
            status: "PAID", // moves from DRAFT/SUBMITTED/PAYMENT_PENDING to PAID
            updatedAt: new Date(),
          },
        });

        // Check if commission for this application was already accrued (anti-double-accrual guard)
        const existingCommission = await tx.ledgerTransaction.findFirst({
          where: {
            applicationId: existingTx.applicationId,
            type: "COMMISSION_ACCRUAL",
            status: "CONFIRMED",
          },
        });

        // Accrue 20% commission to referred teacher if present and not already accrued
        const teacherProfile = existingTx.application.referralTeacher;
        if (teacherProfile && !existingCommission) {
          const commissionRate = teacherProfile.commissionRate || 0.20;
          const commissionAmount = Math.round(payload.amount * commissionRate * 100) / 100;

          // Record ledger transaction entry
          await tx.ledgerTransaction.create({
            data: {
              teacherId: teacherProfile.id,
              applicationId: existingTx.applicationId,
              paymentTransactionId: existingTx.id,
              type: "COMMISSION_ACCRUAL",
              amount: commissionAmount,
              status: "CONFIRMED",
              description: `20% referral commission for application ${existingTx.application.code}`,
            },
          });

          // Increment teacher balance atomically
          await tx.teacherProfile.update({
            where: { id: teacherProfile.id },
            data: {
              balance: {
                increment: commissionAmount,
              },
            },
          });
        }

        // Add audit log
        await tx.auditLog.create({
          data: {
            userId: existingTx.userId,
            action: "PAYMENT_CONFIRMED",
            entityType: "Application",
            entityId: existingTx.applicationId,
            details: JSON.stringify({
              transactionId: payload.transactionId,
              amount: payload.amount,
              teacherCommissionAccrued: Boolean(teacherProfile),
            }),
          },
        });
      });

      return {
        received: true,
        status: "PROCESSED",
        message: "Payment successfully confirmed and processed",
      };
    }

    // If payment failed
    await prisma.paymentTransaction.update({
      where: { id: existingTx.id },
      data: { status: "FAILED" },
    });

    return {
      received: true,
      status: "PROCESSED",
      message: "Payment marked as failed",
    };
  }
}

export const paymentGateway = new MockPaymentGateway();
export default paymentGateway;
