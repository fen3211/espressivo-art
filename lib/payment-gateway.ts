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
  currency: string;
  status: "CONFIRMED" | "FAILED";
  signature: string;
}

export interface WebhookResult {
  received: boolean;
  status: "PROCESSED" | "ALREADY_PROCESSED" | "FAILED";
  message?: string;
}

export interface SignatureData {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  applicationId?: string;
}

export interface PaymentGatewayInterface {
  createPaymentSession(params: PaymentSessionParams): Promise<PaymentSessionResult>;
  verifySignature(data: SignatureData, signature: string): boolean;
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
   * Mock checkout is unconditionally prohibited in production.
   * No environment variable (including ENABLE_MOCK_CHECKOUT) can bypass this.
   */
  public isMockAllowed(): boolean {
    if (process.env.NODE_ENV === "production") {
      return false;
    }
    return true;
  }

  /**
   * Generates HMAC-SHA256 signature for a payment payload.
   * Canonical format: `${transactionId}:${amount}:${currency}:${status}`
   * Requires mandatory, normalized uppercase currency.
   */
  public generateSignature(data: SignatureData): string {
    if (!data.transactionId || typeof data.transactionId !== "string" || !data.transactionId.trim()) {
      throw new Error("transactionId is mandatory for generating payment signature");
    }
    if (data.amount === undefined || data.amount === null || isNaN(Number(data.amount))) {
      throw new Error("Valid amount is mandatory for generating payment signature");
    }
    if (!data.currency || typeof data.currency !== "string" || !data.currency.trim()) {
      throw new Error("currency is mandatory for generating payment signature");
    }
    if (!data.status || typeof data.status !== "string" || !data.status.trim()) {
      throw new Error("status is mandatory for generating payment signature");
    }

    const secret = this.getSecret();
    const raw = `${data.transactionId.trim()}:${Number(data.amount)}:${data.currency.trim().toUpperCase()}:${data.status.trim()}`;
    return crypto.createHmac("sha256", secret).update(raw).digest("hex");
  }

  /**
   * Verifies an incoming HMAC-SHA256 signature using timing-safe comparison.
   * Fails closed if signature, currency, or canonical fields are missing or invalid.
   */
  public verifySignature(
    data: SignatureData,
    signature: string
  ): boolean {
    if (!signature || typeof signature !== "string" || !signature.trim()) {
      return false;
    }
    if (!data || !data.currency || typeof data.currency !== "string" || !data.currency.trim()) {
      return false;
    }
    if (!data.transactionId || typeof data.transactionId !== "string" || !data.transactionId.trim()) {
      return false;
    }
    if (data.amount === undefined || data.amount === null || isNaN(Number(data.amount))) {
      return false;
    }
    if (!data.status || typeof data.status !== "string" || !data.status.trim()) {
      return false;
    }

    try {
      const expected = this.generateSignature(data);
      const expectedBuffer = Buffer.from(expected, "utf8");
      const signatureBuffer = Buffer.from(signature.trim(), "utf8");
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
   * Unconditionally prohibited in production.
   */
  public async createPaymentSession(params: PaymentSessionParams): Promise<PaymentSessionResult> {
    if (!this.isMockAllowed()) {
      throw new Error(
        "Mock payment checkout is strictly prohibited in production environment. Real acquiring provider must be configured."
      );
    }

    if (params.amount === undefined || params.amount === null || isNaN(Number(params.amount)) || Number(params.amount) <= 0) {
      throw new Error("Invalid payment amount: amount must be greater than zero");
    }

    // Require valid secret even to initialize session
    this.getSecret();

    const transactionId = `mock_tx_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const currency = (params.currency || "RUB").trim().toUpperCase();

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
        amount: Number(params.amount),
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
   * production guards, and atomic CAS 20% teacher commission accrual.
   */
  public async processWebhook(
    payload: WebhookPayload,
    signatureHeader?: string
  ): Promise<WebhookResult> {
    // 0. Production guard: mock payments unconditionally disabled in production
    if (!this.isMockAllowed()) {
      return {
        received: false,
        status: "FAILED",
        message: "Mock payment webhook processing is disabled in production environment",
      };
    }

    // 1. Mandatory payload validations
    if (!payload) {
      return {
        received: false,
        status: "FAILED",
        message: "Webhook payload is missing",
      };
    }

    const { transactionId, applicationId, amount, currency, status } = payload;
    const signature = signatureHeader || payload.signature;

    if (!transactionId || typeof transactionId !== "string" || !transactionId.trim()) {
      return {
        received: false,
        status: "FAILED",
        message: "Missing or invalid transactionId in webhook payload",
      };
    }

    if (!applicationId || typeof applicationId !== "string" || !applicationId.trim()) {
      return {
        received: false,
        status: "FAILED",
        message: "Missing or invalid applicationId in webhook payload",
      };
    }

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
      return {
        received: false,
        status: "FAILED",
        message: "Missing or invalid payment amount in webhook payload",
      };
    }

    // Strict Currency Validation: Currency is mandatory
    if (!currency || typeof currency !== "string" || !currency.trim()) {
      return {
        received: false,
        status: "FAILED",
        message: "Payment currency is mandatory in webhook payload",
      };
    }

    if (status !== "CONFIRMED" && status !== "FAILED") {
      return {
        received: false,
        status: "FAILED",
        message: `Invalid payment status: ${status}`,
      };
    }

    if (!signature || typeof signature !== "string" || !signature.trim()) {
      return {
        received: false,
        status: "FAILED",
        message: "Missing webhook signature",
      };
    }

    const normalizedCurrency = currency.trim().toUpperCase();

    // 2. Strict HMAC-SHA256 signature verification including currency
    const isValidSignature = this.verifySignature(
      {
        transactionId: transactionId.trim(),
        amount: Number(amount),
        currency: normalizedCurrency,
        status,
        applicationId: applicationId.trim(),
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

    // 3. Fetch existing transaction
    const existingTx = await prisma.paymentTransaction.findUnique({
      where: { transactionId: transactionId.trim() },
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
        message: `Transaction ${transactionId} not found`,
      };
    }

    // 3.1 Verify application association
    if (existingTx.applicationId !== applicationId.trim()) {
      return {
        received: false,
        status: "FAILED",
        message: `Application ID mismatch: expected ${existingTx.applicationId}, received ${applicationId}`,
      };
    }

    // 3.2 Verify amount strictly matches original transaction
    const expectedAmount = Number(existingTx.amount);
    const receivedAmount = Number(amount);
    if (isNaN(receivedAmount) || Math.abs(expectedAmount - receivedAmount) > 0.001) {
      return {
        received: false,
        status: "FAILED",
        message: `Payment amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`,
      };
    }

    // 3.3 Verify currency strictly matches saved transaction currency in DB
    const expectedCurrency = (existingTx.currency || "RUB").trim().toUpperCase();
    if (normalizedCurrency !== expectedCurrency) {
      return {
        received: false,
        status: "FAILED",
        message: `Payment currency mismatch: expected ${expectedCurrency}, received ${normalizedCurrency}`,
      };
    }

    // 4. Early Idempotency Check: If already confirmed, do NOT double-process
    if (existingTx.status === "CONFIRMED") {
      return {
        received: true,
        status: "ALREADY_PROCESSED",
        message: "Transaction has already been processed and confirmed",
      };
    }

    // 5. Atomic transaction processing with Compare-And-Swap (CAS)
    if (status === "CONFIRMED") {
      let isWinner = false;

      try {
        await prisma.$transaction(
          async (tx) => {
            // Atomic CAS: Only update if status is NOT CONFIRMED
            const casResult = await tx.paymentTransaction.updateMany({
              where: {
                id: existingTx.id,
                status: { not: "CONFIRMED" },
              },
              data: {
                status: "CONFIRMED",
                updatedAt: new Date(),
              },
            });

            // If count === 0, another concurrent execution won the race
            if (casResult.count === 0) {
              isWinner = false;
              return;
            }

            isWinner = true;

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
                  currency: expectedCurrency,
                  teacherCommissionAccrued: Boolean(teacherProfile && !existingCommission),
                }),
              },
            });
          },
          {
            maxWait: 10000,
            timeout: 15000,
          }
        );
      } catch (err: unknown) {
        // If concurrent transactions queued and one timed out waiting for the database lock,
        // recheck if the transaction was successfully confirmed by the winning concurrent execution
        const recheck = await prisma.paymentTransaction.findUnique({
          where: { id: existingTx.id },
        });
        if (recheck?.status === "CONFIRMED") {
          return {
            received: true,
            status: "ALREADY_PROCESSED",
            message: "Transaction has already been processed and confirmed",
          };
        }
        throw err;
      }

      if (!isWinner) {
        return {
          received: true,
          status: "ALREADY_PROCESSED",
          message: "Transaction has already been processed and confirmed",
        };
      }

      return {
        received: true,
        status: "PROCESSED",
        message: "Payment successfully confirmed and processed",
      };
    }

    // If payment failed: atomic update ensuring we never overwrite CONFIRMED
    const failResult = await prisma.paymentTransaction.updateMany({
      where: {
        id: existingTx.id,
        status: { not: "CONFIRMED" },
      },
      data: {
        status: "FAILED",
        updatedAt: new Date(),
      },
    });

    if (failResult.count === 0) {
      return {
        received: true,
        status: "ALREADY_PROCESSED",
        message: "Transaction has already been confirmed and cannot be failed",
      };
    }

    return {
      received: true,
      status: "PROCESSED",
      message: "Payment marked as failed",
    };
  }
}

export const paymentGateway = new MockPaymentGateway();
export default paymentGateway;
