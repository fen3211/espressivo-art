'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { PlusCircle, Sliders } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

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
  const { dict } = useLanguage();

  const competitions: CompetitionRow[] = [
    {
      id: '1',
      slug: 'espressivo-vocal-young-talents',
      title: 'espressivo VOCAL — Young Talents (Season I)',
      status: 'OPEN',
      statusLabel: dict.statuses.APPROVED,
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
      statusLabel: dict.statuses.PENDING,
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
      statusLabel: dict.statuses.UNDER_REVIEW,
      entryFee: '3 000 ₽ / €55',
      startDate: '15.11.2026',
      endDate: '30.01.2027',
      appsCount: 0,
    },
  ];

  const columns: Column<CompetitionRow>[] = [
    {
      key: 'title',
      header: dict.admin.competitions.tableHeaders.competitionAndSeason,
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">{r.title}</div>
          <div className="font-mono text-xs text-[#6199f6]">/{r.slug}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: dict.admin.competitions.tableHeaders.seasonStatus,
      render: (r) => (
        <Badge
          status={r.status === 'OPEN' ? 'PAID' : 'PAYMENT_PENDING'}
          label={r.statusLabel}
        />
      ),
    },
    {
      key: 'entryFee',
      header: dict.admin.competitions.tableHeaders.entryFee,
      render: (r) => <span className="font-mono text-xs font-semibold text-[#fcfcfc]">{r.entryFee}</span>,
    },
    {
      key: 'dates',
      header: dict.admin.competitions.tableHeaders.timeline,
      render: (r) => (
        <span className="text-xs text-[#a3a3b3]">
          {r.startDate} — {r.endDate}
        </span>
      ),
    },
    {
      key: 'appsCount',
      header: dict.admin.competitions.tableHeaders.submittedApps,
      render: (r) => <span className="font-mono text-sm font-bold text-[#6199f6]">{r.appsCount}</span>,
    },
    {
      key: 'actions',
      header: dict.admin.competitions.tableHeaders.actions,
      align: 'right',
      render: () => (
        <Button variant="ghost" size="sm" iconLeft={<Sliders className="w-3.5 h-3.5" />}>
          {dict.admin.competitions.settingsBtn}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            {dict.admin.competitions.tag}
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            {dict.admin.competitions.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {dict.admin.competitions.subtitle}
          </p>
        </div>

        <Button
          variant="iris-action"
          size="md"
          iconLeft={<PlusCircle className="w-4 h-4" />}
          onClick={() => alert(dict.admin.competitions.createSeasonAlert)}
        >
          {dict.admin.competitions.createSeasonBtn}
        </Button>
      </div>

      <Table columns={columns} data={competitions} />
    </div>
  );
}
