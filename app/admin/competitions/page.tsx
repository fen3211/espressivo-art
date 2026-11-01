'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { PlusCircle, Sliders, Calendar, DollarSign } from 'lucide-react';

interface CompetitionRow extends Record<string, unknown> {
  id: string;
  slug: string;
  title: string;
  status: string;
  statusLabel: string;
  entryFee: string;
  startDate: string;
  endDate: string;
  appsCount: number;
}

export default function AdminCompetitionsPage() {
  const competitions: CompetitionRow[] = [
    {
      id: '1',
      slug: 'espressivo-vocal-young-talents',
      title: 'espressivo VOCAL — Young Talents (Season I)',
      status: 'OPEN',
      statusLabel: 'Приём заявок',
      entryFee: '2 500 ₽ / €45',
      startDate: '01.02.2026',
      endDate: '15.06.2026',
      appsCount: 580,
    },
    {
      id: '2',
      slug: 'espressivo-piano-masterworks',
      title: 'espressivo PIANO — Masterworks (Season II)',
      status: 'UPCOMING',
      statusLabel: 'Анонс',
      entryFee: '3 000 ₽ / €55',
      startDate: '01.09.2026',
      endDate: '15.11.2026',
      appsCount: 0,
    },
    {
      id: '3',
      slug: 'espressivo-strings-virtuoso',
      title: 'espressivo STRINGS — Virtuoso (Season III)',
      status: 'UPCOMING',
      statusLabel: 'В разработке',
      entryFee: '3 000 ₽ / €55',
      startDate: '15.11.2026',
      endDate: '30.01.2027',
      appsCount: 0,
    },
  ];

  const columns: Column<CompetitionRow>[] = [
    {
      key: 'title',
      header: 'Конкурс и сезон',
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">{r.title}</div>
          <div className="font-mono text-xs text-[#6199f6]">/{r.slug}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Статус сезона',
      render: (r) => (
        <Badge
          status={r.status === 'OPEN' ? 'PAID' : 'PAYMENT_PENDING'}
          label={r.statusLabel}
        />
      ),
    },
    {
      key: 'entryFee',
      header: 'Регистрационный взнос',
      render: (r) => <span className="font-mono text-xs font-semibold text-[#fcfcfc]">{r.entryFee}</span>,
    },
    {
      key: 'dates',
      header: 'Сроки проведения',
      render: (r) => (
        <span className="text-xs text-[#a3a3b3]">
          {r.startDate} — {r.endDate}
        </span>
      ),
    },
    {
      key: 'appsCount',
      header: 'Подано заявок',
      render: (r) => <span className="font-mono text-sm font-bold text-[#6199f6]">{r.appsCount}</span>,
    },
    {
      key: 'actions',
      header: 'Действия',
      align: 'right',
      render: () => (
        <Button variant="ghost" size="sm" iconLeft={<Sliders className="w-3.5 h-3.5" />}>
          Настройки
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            SEASONS MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            Управление конкурсами и сезонами
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            Настройка тарифов, дат приема заявок, регламентов и номинаций
          </p>
        </div>

        <Button
          variant="iris-action"
          size="md"
          iconLeft={<PlusCircle className="w-4 h-4" />}
          onClick={() => alert('Открыть мастер создания нового сезона конкурса')}
        >
          Создать новый сезон
        </Button>
      </div>

      <Table columns={columns} data={competitions} />
    </div>
  );
}
