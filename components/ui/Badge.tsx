'use client';

import React from 'react';

import { useLanguage } from '@/components/LanguageContext';

export type BadgeStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'UNDER_REVIEW'
  | 'EVALUATED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'GRAND_PRIX'
  | 'LAUREATE_1'
  | 'LAUREATE_2'
  | 'LAUREATE_3'
  | 'DIPLOMANT'
  | 'PARTICIPANT'
  | string;

export interface BadgeProps {
  status: BadgeStatus;
  label?: string;
  theme?: 'art' | 'cinema';
  className?: string;
}

export function Badge({ status, label, theme = 'cinema', className = '' }: BadgeProps) {
  let langContext: ReturnType<typeof useLanguage> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    langContext = useLanguage();
  } catch {
    // Fallback if rendered outside of LanguageProvider
  }

  const norm = status.toUpperCase();

  // Labels dictionary fallback
  const defaultLabelsRu: Record<string, string> = {
    DRAFT: 'Черновик',
    SUBMITTED: 'Отправлена',
    PAYMENT_PENDING: 'Ожидает оплаты',
    PAID: 'Оплачена',
    UNDER_REVIEW: 'На оценивании',
    EVALUATED: 'Оценена',
    COMPLETED: 'Завершена',
    REJECTED: 'Отклонена',
    PENDING: 'Ожидает рассмотрения',
    APPROVED: 'Одобрено',
    ACTIVE: 'Активен',
    OPEN: 'Приём заявок',
    UPCOMING: 'Анонс',
    GRAND_PRIX: 'Гран-при',
    LAUREATE_1: 'Лауреат I ст.',
    LAUREATE_2: 'Лауреат II ст.',
    LAUREATE_3: 'Лауреат III ст.',
    DIPLOMANT: 'Дипломант',
    PARTICIPANT: 'Участник',
  };

  const defaultLabelsEn: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    PAYMENT_PENDING: 'Pending Payment',
    PAID: 'Paid',
    UNDER_REVIEW: 'Under Review',
    EVALUATED: 'Evaluated',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    ACTIVE: 'Active',
    OPEN: 'Open',
    UPCOMING: 'Announced',
    GRAND_PRIX: 'Grand Prix',
    LAUREATE_1: '1st Degree Laureate',
    LAUREATE_2: '2nd Degree Laureate',
    LAUREATE_3: '3rd Degree Laureate',
    DIPLOMANT: 'Diplomant',
    PARTICIPANT: 'Participant',
  };

  const locale = langContext?.locale || 'ru';
  const dict = langContext?.dict;

  let localizedDefault: string | undefined;
  if (dict) {
    localizedDefault =
      (dict.statuses as Record<string, string>)[norm] ||
      (dict.awards as Record<string, string>)[norm];
  }
  if (!localizedDefault) {
    localizedDefault = locale === 'en' ? defaultLabelsEn[norm] : defaultLabelsRu[norm];
  }

  // If label is passed, but we are in English and the passed label is in Russian, override with localizedDefault
  let displayText = label;
  if (!displayText || (locale === 'en' && label && (defaultLabelsRu[norm] === label || Object.values(defaultLabelsRu).includes(label)))) {
    displayText = localizedDefault || status;
  }

  if (theme === 'art') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 border border-[#000000] text-[#000000] text-[9px] font-sans uppercase font-bold tracking-[0.038em] rounded-none bg-transparent ${className}`}
      >
        {displayText}
      </span>
    );
  }

  // Cinema Mode: 100px pill with violet / status tints
  let colorStyles = 'text-[#757580] bg-[rgba(117,117,128,0.15)] border-[rgba(117,117,128,0.3)]';
  let pulseDot = false;

  if (norm === 'PAID' || norm === 'COMPLETED' || norm === 'SUCCESS') {
    colorStyles = 'text-[#22c55e] bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.35)]';
  } else if (norm === 'PAYMENT_PENDING' || norm === 'PENDING') {
    colorStyles = 'text-[#eab308] bg-[rgba(234,179,8,0.12)] border-[rgba(234,179,8,0.35)]';
  } else if (norm === 'UNDER_REVIEW' || norm === 'IN_EVALUATION') {
    colorStyles = 'text-[#6199f6] bg-[rgba(97,153,246,0.12)] border-[rgba(97,153,246,0.4)]';
    pulseDot = true;
  } else if (norm === 'EVALUATED') {
    colorStyles = 'text-[#dedfee] bg-[rgba(79,79,128,0.25)] border-[#4f4f80]';
  } else if (norm.includes('LAUREATE') || norm === 'GRAND_PRIX') {
    colorStyles = 'text-[#facc15] bg-[rgba(250,204,21,0.15)] border-[rgba(250,204,21,0.5)] font-semibold';
  } else if (norm === 'REJECTED' || norm === 'ERROR') {
    colorStyles = 'text-[#ef4444] bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.4)]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-xs font-medium font-sans ${colorStyles} ${className}`}
    >
      {pulseDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#6199f6] animate-pulse" />
      )}
      <span>{displayText}</span>
    </span>
  );
}
