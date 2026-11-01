'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Copy, Check, Sparkles, Calculator } from 'lucide-react';

export default function TeacherReferralsPage() {
  const { locale, dict } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [studentCount, setStudentCount] = useState(10);
  const referralCode = 'IVANOVA-VOCAL';
  const referralUrl = `https://espressivo-art.com/register?ref=${referralCode}`;

  const feePerStudent = 2500;
  const royaltyPerStudent = feePerStudent * 0.2;
  const totalCalculated = studentCount * royaltyPerStudent;

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          AFFILIATE PROGRAM // 20% ROYALTY
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          {locale === 'ru' ? 'Партнерская программа преподавателя' : 'Teacher Affiliate Program'}
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          {locale === 'ru'
            ? 'Управляйте реферальным кодом, делитесь ссылкой и рассчитывайте ваш доход'
            : 'Manage your referral code, share links, and calculate your royalties'}
        </p>
      </div>

      {/* Code & Link Box */}
      <Card padding="lg" className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#6199f6]" />
          <h2 className="text-lg font-medium text-[#fcfcfc]">
            {locale === 'ru' ? 'Ваш уникальный идентификатор наставника' : 'Your Unique Mentor Identifier'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-[8px] bg-[#040407] border border-[#2a2a32]">
            <span className="text-[10px] text-[#757580] uppercase font-mono block mb-1">
              {locale === 'ru' ? 'Реферальный промокод (для ввода вручную)' : 'Referral Promo Code (manual entry)'}
            </span>
            <div className="text-xl font-mono font-bold text-[#6199f6]">
              {referralCode}
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-[#040407] border border-[#2a2a32] flex flex-col justify-between">
            <span className="text-[10px] text-[#757580] uppercase font-mono block mb-1">
              {locale === 'ru' ? 'Ставка вознаграждения' : 'Royalty Rate'}
            </span>
            <div className="text-xl font-mono font-bold text-[#22c55e]">
              {locale === 'ru' ? '20% с каждой заявки' : '20% per entry'}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#a3a3b3] block mb-2">
            {locale === 'ru' ? 'Прямая реферальная ссылка для отправки родителям:' : 'Direct referral link to send to parents:'}
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              readOnly
              value={referralUrl}
              className="flex-1 h-11 px-4 rounded-full bg-[#040407] border border-[#2a2a32] text-xs font-mono text-[#fcfcfc] select-all focus:outline-none"
            />
            <Button
              variant="iris-action"
              size="md"
              iconLeft={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopy}
            >
              {copied
                ? (locale === 'ru' ? 'Скопировано в буфер!' : 'Copied!')
                : dict.teacher.copyReferralLink}
            </Button>
          </div>
        </div>
      </Card>

      {/* Royalty Calculator Interactive Slider */}
      <Card padding="lg" className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#2a2a32] pb-4">
          <Calculator className="w-5 h-5 text-[#6199f6]" />
          <h2 className="text-lg font-medium text-[#fcfcfc]">
            {locale === 'ru' ? 'Калькулятор вознаграждения педагога' : 'Teacher Royalty Calculator'}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#a3a3b3]">
              {locale === 'ru' ? 'Количество привлеченных учеников:' : 'Number of referred students:'}
            </span>
            <span className="font-mono text-xl font-bold text-[#6199f6]">
              {studentCount} {locale === 'ru' ? 'чел.' : 'students'}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="50"
            value={studentCount}
            onChange={(e) => setStudentCount(parseInt(e.target.value, 10))}
            className="w-full accent-[#6199f6] cursor-pointer"
          />

          <div className="p-4 rounded-[8px] bg-[#040407] border border-[#2a2a32] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs text-[#757580] block">
                {locale === 'ru' ? 'Расчетный доход преподавателя:' : 'Estimated Teacher Income:'}
              </span>
              <span className="text-2xl font-mono font-bold text-[#22c55e]">
                {totalCalculated.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
              </span>
            </div>
            <span className="text-xs text-[#a3a3b3]">
              {locale === 'ru'
                ? '(500 ₽ за каждого участника при взносе 2 500 ₽)'
                : '(500 ₽ per entrant based on 2,500 ₽ entry fee)'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
