'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    competitionTitle: string;
    status: string;
    paymentStatus: string;
  };
  signature: string;
}

export interface MockCheckoutClientProps {
  data: MockCheckoutData | null;
  errorMessage?: string;
  txParam?: string;
  appIdParam?: string;
}

export function MockCheckoutClient({
  data,
  errorMessage,
  txParam,
  appIdParam,
}: MockCheckoutClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage || null);

  const handlePayTest = async () => {
    if (!data) return;

    setIsProcessing(true);
    setError(null);

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
          status: 'CONFIRMED',
          signature: data.signature,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || (result.status !== 'PROCESSED' && result.status !== 'ALREADY_PROCESSED' && !result.received)) {
        throw new Error(result.error || result.message || 'Ошибка обработки тестового платежа');
      }

      setIsSuccess(true);

      // Smooth redirect to the application cabinet with payment=success query flag
      setTimeout(() => {
        router.push(`/dashboard/applications/${data.application.id}?payment=success`);
      }, 700);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Не удалось подтвердить платеж');
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

  if (!data) {
    return (
      <div className="min-h-screen bg-[#07070b] text-[#fcfcfc] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#11111a] border border-[#33334d] rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-serif tracking-tight text-[#fcfcfc]">
              Платежная сессия не найдена
            </h1>
            <p className="text-sm text-[#8f8fa3]">
              {error || 'Указанная транзакция не существует, уже оплачена или переданы неверные параметры.'}
            </p>
            {txParam && (
              <p className="text-xs font-mono text-[#63637a] truncate mt-1">
                ID транзакции: {txParam}
              </p>
            )}
          </div>

          <button
            onClick={handleCancel}
            className="w-full inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[rgba(252,252,252,0.08)] hover:bg-[rgba(252,252,252,0.15)] text-[#fcfcfc] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться к заявкам</span>
          </button>
        </div>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: data.transaction.currency || 'RUB',
    maximumFractionDigits: 0,
  }).format(data.transaction.amount);

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
            <span>Тестовый эквайринг (MOCK)</span>
          </div>
        </div>

        {/* Demo Notice Warning Box */}
        <div className="rounded-xl bg-gradient-to-r from-amber-950/30 via-amber-900/20 to-transparent border border-amber-600/30 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-200 uppercase tracking-wider">
                Внимание: демонстрационный режим оплаты
              </p>
              <p className="text-amber-200/80 leading-relaxed">
                Списание реальных денежных средств <strong>не производится</strong>. Это тестовый шлюз для безопасной валидации бизнес-логики конкурса, комиссионного начисления и автоматического перевода статуса заявки.
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
                Сумма к оплате
              </span>
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#fcfcfc] mt-1 block">
                {formattedAmount}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#8f8fa3] block mb-1">Статус платежа</span>
              <Badge status={data.transaction.status} label={data.transaction.status === 'PENDING' ? 'Ожидает оплаты' : data.transaction.status} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">Код заявки</span>
              <span className="font-mono font-medium text-[#fcfcfc] px-2 py-0.5 rounded bg-[rgba(252,252,252,0.06)] border border-[rgba(252,252,252,0.1)]">
                {data.application.code}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">Конкурс</span>
              <span className="font-medium text-[#fcfcfc] text-right truncate max-w-[260px]">
                {data.application.competitionTitle}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">Участник</span>
              <span className="font-medium text-[#dedfee]">
                {data.application.participantName}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">ID транзакции</span>
              <span className="font-mono text-xs text-[#a3a3b3] truncate max-w-[240px]">
                {data.transaction.transactionId}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#8f8fa3]">Шлюз провайдера</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#6199f6]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>MockGateway (HMAC-SHA256)</span>
              </span>
            </div>
          </div>

          {/* Realistic Mock Visual Card */}
          <div className="rounded-xl bg-gradient-to-tr from-[#1b1b2d] via-[#24243a] to-[#1a1a2b] border border-[#4f4f80]/60 p-4 space-y-3 text-xs shadow-inner">
            <div className="flex items-center justify-between text-[#8f8fa3]">
              <span className="font-mono tracking-widest text-[#dedfee]">ESPRESSIVO TEST CARD</span>
              <CreditCard className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div className="font-mono text-base tracking-[0.25em] text-[#fcfcfc] py-1">
              •••• •••• •••• 4242
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8f8fa3] font-mono">
              <span>TEST HOLDER</span>
              <span>EXP: 12/28</span>
              <span>CVV: 999</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-950/40 border border-red-500/40 p-4 text-xs text-red-200 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-4 text-xs text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Платеж успешно подтвержден! Перенаправление в кабинет заявки...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
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
                  <span>Обработка вебхука...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#07070b]" />
                  <span>Оплачено успешно</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#07070b]" />
                  <span>Оплатить (Тест) / Pay (Test)</span>
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="w-full h-11 rounded-xl bg-transparent border border-[rgba(252,252,252,0.15)] hover:bg-[rgba(252,252,252,0.06)] hover:border-[rgba(252,252,252,0.3)] active:scale-[0.99] text-[#dedfee] text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#8f8fa3]" />
              <span>Отмена / Cancel</span>
            </button>
          </div>
        </div>

        {/* Security Footer Imprint */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-[#63637a] pt-2">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500/70" />
            <span>256-Bit Test TLS</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-[#8f8fa3]" />
            <span>Автоматический чек</span>
          </div>
          <span>•</span>
          <span>espressivo ART Mock Gateway</span>
        </div>
      </div>
    </div>
  );
}
