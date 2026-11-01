'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

export default function TeacherDashboardPage() {
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
      name: 'София Алексеева (13 лет)',
      nomination: 'Академический вокал (Соло)',
      fee: '2 500 ₽',
      royalty: '+500 ₽',
      status: 'PAID',
      statusLabel: 'Оплачена',
    },
    {
      id: '2',
      name: 'Михаил Захаров (15 лет)',
      nomination: 'Эстрадный вокал (Соло)',
      fee: '2 500 ₽',
      royalty: '+500 ₽',
      status: 'PAID',
      statusLabel: 'Оплачена',
    },
    {
      id: '3',
      name: 'Вокальный дуэт «Гармония»',
      nomination: 'Вокальные ансамбли',
      fee: '4 000 ₽',
      royalty: '+800 ₽',
      status: 'UNDER_REVIEW',
      statusLabel: 'На оценивании',
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
            Здравствуйте, Анна Сергеевна
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            ДШИ им. П.И. Чайковского • Ваш баланс готов к выплате
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/teacher/payouts">
            <Button variant="iris-action" size="md" iconLeft={<Wallet className="w-4 h-4" />}>
              Запросить вывод средств
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
                ВАША ПЕРСОНАЛЬНАЯ РЕФЕРАЛЬНАЯ ССЫЛКА
              </span>
            </div>
            <h2 className="text-xl font-medium text-[#fcfcfc]">
              20% с каждой заявки ваших учеников
            </h2>
            <p className="text-xs text-[#a3a3b3] max-w-xl leading-relaxed">
              Отправьте ссылку родителям учеников. При переходе промокод применится автоматически, а вам будет начислено 20% от взноса.
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
              {copied ? 'Скопировано!' : 'Скопировать ссылку'}
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">Доступный баланс</span>
            <Wallet className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#22c55e]">12 500 ₽</div>
            <div className="text-xs text-[#757580] mt-1">Доступно к выводу на карту</div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">Привлечено учеников</span>
            <Users className="w-4 h-4 text-[#6199f6]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#fcfcfc]">14</div>
            <div className="text-xs text-[#757580] mt-1">В сезоне espressivo VOCAL</div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">Всего начислено</span>
            <Coins className="w-4 h-4 text-[#6199f6]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#fcfcfc]">16 500 ₽</div>
            <div className="text-xs text-[#757580] mt-1">За всё время работы</div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">Ставка комиссии</span>
            <span className="text-[10px] font-mono text-[#6199f6] bg-[rgba(97,153,246,0.12)] px-2 py-0.5 rounded-full">
              MAX TIER
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#6199f6]">20.0%</div>
            <div className="text-xs text-[#757580] mt-1">Пожизненный статус наставника</div>
          </div>
        </Card>
      </div>

      {/* Referred Students Table Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#fcfcfc]">
            Последние заявки учеников
          </h2>
          <Link
            href="/teacher/participants"
            className="text-xs text-[#6199f6] hover:underline flex items-center gap-1 font-mono"
          >
            <span>Полный список учеников</span>
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
                  <span className="text-base font-medium text-[#fcfcfc]">{st.name}</span>
                  <Badge status={st.status} label={st.statusLabel} />
                </div>
                <div className="text-xs text-[#a3a3b3]">{st.nomination}</div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-[#757580]">Взнос: {st.fee}</div>
                  <div className="text-sm font-mono font-bold text-[#22c55e]">
                    Ваша комиссия: {st.royalty}
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
