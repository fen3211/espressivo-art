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
  currency?: string;
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
  /**
   * Securely retrieves and validates the mock payment gateway secret.
   * Eliminates insecure fallback defaults. Fails closed if missing or weak (<32 chars).
   */
  public getSecret(): string {
    const secret = process.env.MOCK_PAYMENT_SECRET;
    if (!secret) {
      throw new Error(
        "MOCK_PAYMENT_SECRET configuration is missing. Mock payment operations are blocked."
      );
    }
    if (secret.length < 32) {
      throw new Error(
        `MOCK_PAYMENT_SECRET is insecure: minimum length is 32 characters, got ${secret.length}.`
      );
    }
    return secret;
  }

  /**
   * Checks whether mock payment flows are permitted in the current runtime environment.
   * Mock checkout is strictly disabled in production unless explicit non-production flag is set.
   */
  public isMockAllowed(): boolean {
    if (process.env.NODE_ENV === "production") {
      return process.env.ENABLE_MOCK_CHECKOUT === "true";
    }
    return true;
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
    const secret = this.getSecret();
    const raw = `${data.transactionId}:${data.applicationId}:${data.amount}:${data.status}`;
    return crypto.createHmac("sha256", secret).update(raw).digest("hex");
  }

  /**
   * Verifies an incoming HMAC-SHA256 signature with constant-time equality.
   */
  public verifySignature(
    data: { transactionId: string; applicationId: string; amount: number; status: string },
    signature: string
  ): boolean {
    if (!signature) return false;
    try {
      const expected = this.generateSignature(data);
      const expectedBuffer = Buffer.from(expected, "utf8");
      const signatureBuffer = Buffer.from(signature, "utf8");
      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Creates a mock payment session and initial PENDING transaction record.
   * Prohibited in production unless explicitly authorized.
   */
  public async createPaymentSession(params: PaymentSessionParams): Promise<PaymentSessionResult> {
    if (!this.isMockAllowed()) {
      throw new Error(
        "Mock payment checkout is strictly prohibited in production environment. Real acquiring provider must be configured."
      );
    }

    // Require valid secret even to initialize session
    this.getSecret();

    const transactionId = `mock_tx_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const currency = (params.currency || "RUB").toUpperCase();

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: params.applicationId },
    });

    if (!application) {
      throw new Error(`Application ${params.applicationId} not found`);
    }

    // Verify application ownership
    if (application.userId !== params.userId) {
      throw new Error("Cannot create payment session for an application belonging to another user");
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
   * Idempotent webhook processing with anti-replay protection, strict amount/currency verification,
   * production guards, and atomic 20% teacher commission accrual.
   */
  public async processWebhook(
    payload: WebhookPayload,
    signatureHeader?: string
  ): Promise<WebhookResult> {
    if (!this.isMockAllowed()) {
      return {
        received: false,
        status: "FAILED",
        message: "Mock payment webhook processing is disabled in production environment",
      };
    }

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

    // 2.1 Verify application association
    if (existingTx.applicationId !== payload.applicationId) {
      return {
        received: false,
        status: "FAILED",
        message: `Application ID mismatch: expected ${existingTx.applicationId}, received ${payload.applicationId}`,
      };
    }

    // 2.2 Verify amount strictly matches original transaction
    const expectedAmount = Number(existingTx.amount);
    const receivedAmount = Number(payload.amount);
    if (isNaN(receivedAmount) || Math.abs(expectedAmount - receivedAmount) > 0.001) {
      return {
        received: false,
        status: "FAILED",
        message: `Payment amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`,
      };
    }

    // 2.3 Verify currency if provided in webhook payload
    if (payload.currency && existingTx.currency && payload.currency.toUpperCase() !== existingTx.currency.toUpperCase()) {
      return {
        received: false,
        status: "FAILED",
        message: `Payment currency mismatch: expected ${existingTx.currency}, received ${payload.currency}`,
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

    // 4. Atomic transaction processing with inside-transaction double-check
    if (payload.status === "CONFIRMED") {
      await prisma.$transaction(async (tx) => {
        // Re-read inside transaction to prevent race conditions
        const freshTx = await tx.paymentTransaction.findUnique({
          where: { id: existingTx.id },
        });

        if (!freshTx || freshTx.status === "CONFIRMED") {
          return;
        }

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
            status: "PAID",
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
          const commissionAmount = Math.round(existingTx.amount * commissionRate * 100) / 100;

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
              amount: existingTx.amount,
              currency: existingTx.currency,
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
