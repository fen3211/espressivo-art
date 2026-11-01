'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Trophy, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface CalculationRow extends Record<string, unknown> {
  id: string;
  code: string;
  participantName: string;
  nomination: string;
  scoreAvg: number;
  awardKey: 'GRAND_PRIX' | 'LAUREATE_1' | 'LAUREATE_2' | 'LAUREATE_3';
  certificateStatus: string;
}

export default function AdminResultsCalculationPage() {
  const { dict } = useLanguage();
  const [calculated, setCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

  const [data, setData] = useState<CalculationRow[]>([
    {
      id: '1',
      code: 'EXP-2026-0012',
      participantName: 'Мария Васильева (16 лет)',
      nomination: 'Академический вокал (Соло)',
      scoreAvg: 100,
      awardKey: 'GRAND_PRIX',
      certificateStatus: dict.admin.results.statusReady,
    },
    {
      id: '2',
      code: 'EXP-2026-0089',
      participantName: 'Алексеева София (13 лет)',
      nomination: 'Эстрадный вокал (Соло)',
      scoreAvg: 96,
      awardKey: 'LAUREATE_1',
      certificateStatus: dict.admin.results.statusReady,
    },
    {
      id: '3',
      code: 'EXP-2026-0045',
      participantName: 'Дмитрий Соколов (10 лет)',
      nomination: 'Академический вокал (Соло)',
      scoreAvg: 93,
      awardKey: 'LAUREATE_2',
      certificateStatus: dict.admin.results.statusReady,
    },
    {
      id: '4',
      code: 'EXP-2026-0077',
      participantName: 'Вокальный ансамбль «Созвучие»',
      nomination: 'Вокальные ансамбли',
      scoreAvg: 88,
      awardKey: 'LAUREATE_3',
      certificateStatus: dict.admin.results.statusReady,
    },
  ]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/calculate-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const resJson = await res.json();
      if (res.ok && resJson.results && resJson.results.length > 0) {
        setData(resJson.results.map((r: any, idx: number) => ({
          id: String(idx + 1),
          code: r.applicationCode,
          participantName: r.participantName,
          nomination: 'Академический вокал (Соло)',
          scoreAvg: r.totalScore,
          awardKey: r.awardDegree,
          certificateStatus: dict.admin.results.statusGenerated,
        })));
        setStatusMessage(resJson.message || 'Результаты успешно рассчитаны');
      } else {
        setStatusMessage(resJson.message || 'Расчет завершен');
      }
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
      setCalculated(true);
    }
  };

  const handlePublish = () => {
    setPublished(true);
    alert(dict.admin.results.resultsPublishedAlert);
  };

  const columns: Column<CalculationRow>[] = [
    {
      key: 'code',
      header: dict.admin.results.tableHeaders.code,
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'participantName',
      header: dict.admin.results.tableHeaders.participant,
      render: (r) => <span className="font-medium text-[#fcfcfc]">{r.participantName}</span>,
    },
    {
      key: 'nomination',
      header: dict.admin.results.tableHeaders.nomination,
      render: (r) => <span className="text-sm text-[#dedfee]">{r.nomination}</span>,
    },
    {
      key: 'scoreAvg',
      header: dict.admin.results.tableHeaders.averageScore,
      render: (r) => (
        <span className="font-mono text-sm font-bold text-[#6199f6]">
          {r.scoreAvg} <span className="text-xs text-[#757580]">/ 100</span>
        </span>
      ),
    },
    {
      key: 'calculatedAward',
      header: dict.admin.results.tableHeaders.calculatedAward,
      render: (r) => (
        <Badge
          status={r.awardKey}
          label={dict.awards[r.awardKey]}
        />
      ),
    },
    {
      key: 'certificateStatus',
      header: dict.admin.results.tableHeaders.diplomaStatus,
      render: (r) => (
        <span className="font-mono text-xs text-[#22c55e]">
          {r.certificateStatus}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            {dict.admin.results.tag}
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            {dict.admin.results.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {dict.admin.results.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="md"
            loading={loading}
            iconLeft={<RefreshCw className="w-4 h-4" />}
            onClick={handleCalculate}
          >
            {calculated ? dict.admin.results.recalculateDoneBtn : dict.admin.results.recalculateBtn}
          </Button>

          <Button
            variant="iris-action"
            size="md"
            disabled={!calculated}
            iconLeft={<Trophy className="w-4 h-4" />}
            onClick={handlePublish}
          >
            {published ? dict.admin.results.publishedBtn : dict.admin.results.publishResultsBtn}
          </Button>
        </div>
      </div>

      <Table columns={columns} data={data} />
    </div>
  );
}
