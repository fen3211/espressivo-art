'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Wallet,
  Coins,
  Users,
  Copy,
  Check,
  ArrowUpRight,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const { locale, dict } = useLanguage();
  const [copied, setCopied] = useState(false);
  const referralCode = 'IVANOVA-VOCAL';
  const referralUrl = `https://espressivo-art.com/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const students = [
    {
      id: '1',
      nameRu: 'София Алексеева (13 лет)',
      nameEn: 'Sofia Alekseeva (13 yrs)',
      nominationRu: 'Академический вокал (Соло)',
      nominationEn: 'Academic Vocal (Solo)',
      fee: '2 500 ₽',
      royalty: '+500 ₽',
      status: 'PAID',
    },
    {
      id: '2',
      nameRu: 'Михаил Захаров (15 лет)',
      nameEn: 'Mikhail Zakharov (15 yrs)',
      nominationRu: 'Эстрадный вокал (Соло)',
      nominationEn: 'Pop & Contemporary Vocal (Solo)',
      fee: '2 500 ₽',
      royalty: '+500 ₽',
      status: 'PAID',
    },
    {
      id: '3',
      nameRu: 'Вокальный дуэт «Гармония»',
      nameEn: 'Vocal Duet "Harmonia"',
      nominationRu: 'Вокальные ансамбли',
      nominationEn: 'Vocal Ensembles',
      fee: '4 000 ₽',
      royalty: '+800 ₽',
      status: 'UNDER_REVIEW',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            PEDAGOGICAL HUB // 20% COMMISSION ACTIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            {dict.dashboard.welcome}, {locale === 'ru' ? 'Анна Сергеевна' : 'Anna Sergeevna'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {locale === 'ru'
              ? 'ДШИ им. П.И. Чайковского • Ваш баланс готов к выплате'
              : 'Tchaikovsky School of Music • Your royalty balance is ready for payout'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/teacher/payouts">
            <Button variant="iris-action" size="md" iconLeft={<Wallet className="w-4 h-4" />}>
              {dict.teacher.payout.requestPayoutBtn}
            </Button>
          </Link>
        </div>
      </div>

      {/* Referral Link Quick Card */}
      <Card
        padding="lg"
        className="bg-gradient-to-r from-[rgba(24,24,38,0.95)] via-[rgba(10,10,19,0.95)] to-[rgba(79,79,128,0.2)] border border-[#4f4f80]"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6199f6] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6199f6]">
                {locale === 'ru' ? 'ВАША ПЕРСОНАЛЬНАЯ РЕФЕРАЛЬНАЯ ССЫЛКА' : 'YOUR PERSONAL REFERRAL LINK'}
              </span>
            </div>
            <h2 className="text-xl font-medium text-[#fcfcfc]">
              {locale === 'ru' ? '20% с каждой заявки ваших учеников' : '20% Royalty on Every Student Entry'}
            </h2>
            <p className="text-xs text-[#a3a3b3] max-w-xl leading-relaxed">
              {dict.teacher.partnerProgramDesc}
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-[#040407] border border-[#2a2a32] text-xs font-mono text-[#6199f6] truncate select-all">
              {referralUrl}
            </div>
            <Button
              variant="primary-vellum"
              size="md"
              iconLeft={copied ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopy}
            >
              {copied ? (locale === 'ru' ? 'Скопировано!' : 'Copied!') : dict.teacher.copyReferralLink}
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">
              {dict.teacher.stats.commissionBalance}
            </span>
            <Wallet className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#22c55e]">12 500 ₽</div>
            <div className="text-xs text-[#757580] mt-1">
              {locale === 'ru' ? 'Доступно к выводу на карту' : 'Available for bank payout'}
            </div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">
              {dict.teacher.stats.totalReferrals}
            </span>
            <Users className="w-4 h-4 text-[#6199f6]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#fcfcfc]">14</div>
            <div className="text-xs text-[#757580] mt-1">
              {locale === 'ru' ? 'В сезоне espressivo VOCAL' : 'In season espressivo VOCAL'}
            </div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">
              {locale === 'ru' ? 'Всего начислено' : 'Total Accrued'}
            </span>
            <Coins className="w-4 h-4 text-[#6199f6]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#fcfcfc]">16 500 ₽</div>
            <div className="text-xs text-[#757580] mt-1">
              {locale === 'ru' ? 'За всё время работы' : 'All-time total'}
            </div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">
              {locale === 'ru' ? 'Ставка комиссии' : 'Commission Rate'}
            </span>
            <span className="text-[10px] font-mono text-[#6199f6] bg-[rgba(97,153,246,0.12)] px-2 py-0.5 rounded-full">
              MAX TIER
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#6199f6]">20.0%</div>
            <div className="text-xs text-[#757580] mt-1">
              {locale === 'ru' ? 'Пожизненный статус наставника' : 'Lifetime mentor status'}
            </div>
          </div>
        </Card>
      </div>

      {/* Referred Students Table Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#fcfcfc]">
            {locale === 'ru' ? 'Последние заявки учеников' : 'Recent Student Submissions'}
          </h2>
          <Link
            href="/teacher/participants"
            className="text-xs text-[#6199f6] hover:underline flex items-center gap-1 font-mono"
          >
            <span>{locale === 'ru' ? 'Полный список учеников' : 'All Entrants'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {students.map((st) => (
            <Card
              key={st.id}
              padding="md"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-base font-medium text-[#fcfcfc]">
                    {locale === 'ru' ? st.nameRu : st.nameEn}
                  </span>
                  <Badge status={st.status} />
                </div>
                <div className="text-xs text-[#a3a3b3]">
                  {locale === 'ru' ? st.nominationRu : st.nominationEn}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-[#757580]">
                    {locale === 'ru' ? 'Взнос: ' : 'Fee: '}{st.fee}
                  </div>
                  <div className="text-sm font-mono font-bold text-[#22c55e]">
                    {locale === 'ru' ? 'Ваша комиссия: ' : 'Your commission: '}{st.royalty}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
