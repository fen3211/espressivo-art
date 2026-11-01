'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Badge } from '@/components/ui/Badge';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Receipt,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export interface MockCheckoutData {
  transaction: {
    transactionId: string;
    applicationId: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
  };
  application: {
    id: string;
    code: string;
    participantName: string;
    competitionTitleRu: string;
    competitionTitleEn: string;
    status: string;
    paymentStatus: string;
  };
  signature: string;
}

export interface MockCheckoutClientProps {
  data: MockCheckoutData | null;
  errorCode?: string;
  isProductionBlocked?: boolean;
  isAlreadyPaid?: boolean;
  txParam?: string;
  appIdParam?: string;
}

export function MockCheckoutClient({
  data,
  errorCode,
  isProductionBlocked,
  isAlreadyPaid,
  txParam,
  appIdParam,
}: MockCheckoutClientProps) {
  const router = useRouter();
  const { locale, dict } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Handle error resolution from dictionary
  const resolveErrorMessage = (code?: string): string => {
    if (!code) return dict.checkout.sessionNotFoundDesc;
    switch (code) {
      case 'MOCK_CHECKOUT_DISABLED_IN_PRODUCTION':
        return dict.checkout.mockDisabledInProd;
      case 'UNAUTHORIZED':
        return dict.checkout.unauthorizedCheckout;
      case 'ACCESS_FORBIDDEN':
        return dict.checkout.accessForbiddenCheckout;
      case 'TRANSACTION_ID_REQUIRED':
        return locale === 'ru'
          ? 'Требуется идентификатор транзакции. Прямой доступ по коду заявки запрещен.'
          : 'Transaction identifier required. Direct access via application ID is forbidden.';
      case 'TRANSACTION_NOT_FOUND':
        return dict.checkout.sessionNotFoundDesc;
      case 'APPLICATION_MISMATCH':
        return locale === 'ru'
          ? 'Идентификатор транзакции не соответствует переданной заявке.'
          : 'Transaction identifier does not match the provided application.';
      default:
        return dict.checkout.sessionNotFoundDesc;
    }
  };

  const handlePayTest = async () => {
    if (!data || isAlreadyPaid || isProductionBlocked) return;

    setIsProcessing(true);
    setCustomError(null);

    try {
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-signature': data.signature,
        },
        body: JSON.stringify({
          transactionId: data.transaction.transactionId,
          applicationId: data.transaction.applicationId,
          amount: data.transaction.amount,
          currency: data.transaction.currency,
          status: 'CONFIRMED',
          signature: data.signature,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || (result.status !== 'PROCESSED' && result.status !== 'ALREADY_PROCESSED' && !result.received)) {
        throw new Error(result.error || result.message || dict.errors.paymentFailed);
      }

      setIsSuccess(true);

      // Smooth redirect to the application workspace
      setTimeout(() => {
        router.push(`/dashboard/applications/${data.application.id}?payment=success`);
      }, 700);
    } catch (err: unknown) {
      const e = err as Error;
      setCustomError(e.message || dict.errors.paymentFailed);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    const returnAppId = data?.application.id || appIdParam;
    if (returnAppId) {
      router.push(`/dashboard/applications/${returnAppId}`);
    } else {
      router.push('/dashboard/applications');
    }
  };

  // 1. Production Blocked UI
  if (isProductionBlocked) {
    return (
      <div className="min-h-screen bg-[#07070b] text-[#fcfcfc] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#11111a] border border-red-500/30 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-serif tracking-tight text-[#fcfcfc]">
              {locale === 'ru' ? 'Тестовый эквайринг недоступен' : 'Mock Acquiring Disabled'}
            </h1>
            <p className="text-sm text-[#a3a3b3] leading-relaxed">
              {dict.checkout.mockDisabledInProd}
            </p>
          </div>

          <button
            onClick={handleCancel}
            className="w-full inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[rgba(252,252,252,0.08)] hover:bg-[rgba(252,252,252,0.15)] text-[#fcfcfc] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{dict.checkout.returnToApplications}</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Error or Missing Data UI
  if (!data || errorCode) {
    return (
      <div className="min-h-screen bg-[#07070b] text-[#fcfcfc] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#11111a] border border-[#33334d] rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-serif tracking-tight text-[#fcfcfc]">
              {dict.checkout.sessionNotFound}
            </h1>
            <p className="text-sm text-[#8f8fa3]">
              {resolveErrorMessage(errorCode)}
            </p>
            {txParam && (
              <p className="text-xs font-mono text-[#63637a] truncate mt-1">
                {dict.checkout.transactionId}: {txParam}
              </p>
            )}
          </div>

          <button
            onClick={handleCancel}
            className="w-full inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[rgba(252,252,252,0.08)] hover:bg-[rgba(252,252,252,0.15)] text-[#fcfcfc] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{dict.checkout.returnToApplications}</span>
          </button>
        </div>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    style: 'currency',
    currency: data.transaction.currency || 'RUB',
    maximumFractionDigits: 0,
  }).format(data.transaction.amount);

  const competitionTitle =
    locale === 'ru' ? data.application.competitionTitleRu : data.application.competitionTitleEn;

  return (
    <div className="min-h-screen bg-[#07070b] text-[#fcfcfc] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#6199f6]/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#6199f6]/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[400px] bg-gradient-to-t from-[#c5a059]/5 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-xl w-full mx-auto space-y-6">
        {/* Brand Bar */}
        <div className="flex items-center justify-between border-b border-[rgba(252,252,252,0.08)] pb-5">
          <div className="flex items-center gap-2.5">
            <span className="text-base tracking-[0.16em] uppercase font-serif text-[#fcfcfc]">
              espressivo <span className="text-[#c5a059] font-sans text-xs tracking-widest font-semibold">ART</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{dict.checkout.mockAcquiringBadge}</span>
          </div>
        </div>

        {/* Demo Notice Warning Box */}
        <div className="rounded-xl bg-gradient-to-r from-amber-950/30 via-amber-900/20 to-transparent border border-amber-600/30 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-200 uppercase tracking-wider">
                {dict.checkout.mockNoticeTitle}
              </p>
              <p className="text-amber-200/80 leading-relaxed">
                {dict.checkout.mockNoticeDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Card Container */}
        <div className="rounded-2xl bg-gradient-to-b from-[#131320] to-[#0c0c14] border border-[#4f4f80] shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(79,79,128,0.2)] p-6 sm:p-8 space-y-6">
          {/* Amount Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#292942]">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#8f8fa3] block">
                {dict.checkout.amountDue}
              </span>
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fcfcfc] mt-1 block">
                {formattedAmount}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#8f8fa3] block mb-1">
                {dict.checkout.paymentStatus}
              </span>
              <Badge
                status={data.transaction.status}
                label={
                  isAlreadyPaid
                    ? dict.statuses.PAID
                    : data.transaction.status === 'PENDING'
                    ? locale === 'ru'
                      ? 'Ожидает оплаты'
                      : 'Pending Payment'
                    : data.transaction.status
                }
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">{dict.checkout.applicationCode}</span>
              <span className="font-mono font-medium text-[#fcfcfc] px-2 py-0.5 rounded bg-[rgba(252,252,252,0.06)] border border-[rgba(252,252,252,0.1)]">
                {data.application.code}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">{dict.checkout.competition}</span>
              <span className="font-medium text-[#fcfcfc] text-right truncate max-w-[260px]">
                {competitionTitle}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">{dict.checkout.participant}</span>
              <span className="font-medium text-[#dedfee]">
                {data.application.participantName}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">{dict.checkout.transactionId}</span>
              <span className="font-mono text-xs text-[#a3a3b3] truncate max-w-[240px]">
                {data.transaction.transactionId}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">{dict.checkout.gatewayProvider}</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#6199f6]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>MockGateway (HMAC-SHA256)</span>
              </span>
            </div>
          </div>

          {/* Realistic Mock Visual Card */}
          <div className="rounded-xl bg-gradient-to-tr from-[#1b1b2d] via-[#24243a] to-[#1a1a2b] border border-[#4f4f80]/60 p-4 space-y-3 text-xs shadow-inner">
            <div className="flex items-center justify-between text-[#8f8fa3]">
              <span className="font-mono tracking-widest text-[#dedfee]">{dict.checkout.testCardTitle}</span>
              <CreditCard className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div className="font-mono text-base tracking-[0.25em] text-[#fcfcfc] py-1">
              •••• •••• •••• 4242
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8f8fa3] font-mono">
              <span>{dict.checkout.cardHolder}</span>
              <span>EXP: 12/28</span>
              <span>CVV: 999</span>
            </div>
          </div>

          {/* Already Paid Banner */}
          {isAlreadyPaid && (
            <div className="rounded-xl bg-blue-950/40 border border-blue-500/40 p-4 text-xs text-blue-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{dict.checkout.alreadyPaidDesc}</span>
            </div>
          )}

          {/* Custom Error Message */}
          {customError && (
            <div className="rounded-xl bg-red-950/40 border border-red-500/40 p-4 text-xs text-red-200 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{customError}</span>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-4 text-xs text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dict.checkout.paymentSuccessBanner}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isAlreadyPaid ? (
              <button
                onClick={handlePayTest}
                disabled={isProcessing || isSuccess}
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-[#07070b] font-semibold text-sm tracking-wide shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:shadow-[0_0_32px_rgba(16,185,129,0.45)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-[#07070b]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{dict.checkout.processingWebhook}</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#07070b]" />
                    <span>{dict.common.success}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#07070b]" />
                    <span>{dict.checkout.payTestBtn}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{dict.checkout.returnToApplications}</span>
              </button>
            )}

            {!isAlreadyPaid && (
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="w-full h-11 rounded-xl bg-transparent border border-[rgba(252,252,252,0.15)] hover:bg-[rgba(252,252,252,0.06)] hover:border-[rgba(252,252,252,0.3)] active:scale-[0.99] text-[#dedfee] text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#8f8fa3]" />
                <span>{dict.checkout.cancelBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Security Footer Imprint */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-[#63637a] pt-2">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500/70" />
            <span>{dict.checkout.tlsNotice}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-[#8f8fa3]" />
            <span>{dict.checkout.automatedReceipt}</span>
          </div>
          <span>•</span>
          <span>espressivo ART Mock Gateway</span>
        </div>
      </div>
    </div>
  );
}
