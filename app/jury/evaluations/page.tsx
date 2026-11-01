'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface EvaluatedRow extends Record<string, unknown> {
  id: string;
  code: string;
  repertoire: string;
  nomination: string;
  scores: string;
  totalScore: number;
  awardKey: 'LAUREATE_1' | 'GRAND_PRIX' | 'LAUREATE_2';
  submittedAt: string;
}

export default function JuryEvaluationsArchivePage() {
  const { dict } = useLanguage();

  const evaluations: EvaluatedRow[] = [
    {
      id: 'app-002',
      code: 'EXP-2026-0089',
      repertoire: 'И. Крутой — "Любовь, похожая на сон"',
      nomination: 'Эстрадный вокал (Соло)',
      scores: '24 / 25 / 24 / 23',
      totalScore: 96,
      awardKey: 'LAUREATE_1',
      submittedAt: '02.05.2026 16:40',
    },
    {
      id: 'app-010',
      code: 'EXP-2026-0012',
      repertoire: 'В.А. Моцарт — Ария Царицы ночи',
      nomination: 'Академический вокал (Соло)',
      scores: '25 / 25 / 25 / 25',
      totalScore: 100,
      awardKey: 'GRAND_PRIX',
      submittedAt: '29.04.2026 19:15',
    },
    {
      id: 'app-011',
      code: 'EXP-2026-0033',
      repertoire: 'Дж. Гершвин — "The Man I Love"',
      nomination: 'Джазовый вокал',
      scores: '22 / 24 / 23 / 22',
      totalScore: 91,
      awardKey: 'LAUREATE_2',
      submittedAt: '25.04.2026 11:05',
    },
  ];

  const columns: Column<EvaluatedRow>[] = [
    {
      key: 'code',
      header: dict.jury.archive.tableHeaders.code,
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'repertoire',
      header: dict.jury.archive.tableHeaders.repertoireAndNomination,
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc] text-sm">{r.repertoire}</div>
          <div className="text-xs text-[#757580]">{r.nomination}</div>
        </div>
      ),
    },
    {
      key: 'scores',
      header: dict.jury.archive.tableHeaders.rubricScores,
      render: (r) => <span className="font-mono text-xs text-[#a3a3b3]">{r.scores}</span>,
    },
    {
      key: 'totalScore',
      header: dict.jury.archive.tableHeaders.totalScore,
      render: (r) => (
        <span className="font-mono text-sm font-bold text-[#6199f6]">
          {r.totalScore} / 100
        </span>
      ),
    },
    {
      key: 'award',
      header: dict.jury.archive.tableHeaders.award,
      render: (r) => (
        <Badge
          status={r.awardKey}
          label={dict.awards[r.awardKey]}
        />
      ),
    },
    {
      key: 'submittedAt',
      header: dict.jury.archive.tableHeaders.submittedAt,
      render: (r) => <span className="text-xs text-[#757580]">{r.submittedAt}</span>,
    },
    {
      key: 'actions',
      header: dict.jury.archive.tableHeaders.actions,
      align: 'right',
      render: (r) => (
        <Link href={`/jury/applications/${r.id}`}>
          <Button variant="ghost" size="sm" iconLeft={<Eye className="w-3.5 h-3.5" />}>
            {dict.common.view}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          {dict.jury.archive.tag}
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          {dict.jury.archive.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          {dict.jury.archive.subtitle}
        </p>
      </div>

      <Table columns={columns} data={evaluations} />
    </div>
  );
}
