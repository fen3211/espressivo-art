'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Trophy, Award, CheckCircle2, RefreshCw } from 'lucide-react';

interface CalculationRow extends Record<string, unknown> {
  id: string;
  code: string;
  participantName: string;
  nomination: string;
  scoreAvg: number;
  calculatedAward: string;
  certificateStatus: string;
}

export default function AdminResultsCalculationPage() {
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
      calculatedAward: 'Гран-при (Grand Prix)',
      certificateStatus: 'ГОТОВ К ГЕНЕРАЦИИ',
    },
    {
      id: '2',
      code: 'EXP-2026-0089',
      participantName: 'Алексеева София (13 лет)',
      nomination: 'Эстрадный вокал (Соло)',
      scoreAvg: 96,
      calculatedAward: 'Лауреат I степени',
      certificateStatus: 'ГОТОВ К ГЕНЕРАЦИИ',
    },
    {
      id: '3',
      code: 'EXP-2026-0045',
      participantName: 'Дмитрий Соколов (10 лет)',
      nomination: 'Академический вокал (Соло)',
      scoreAvg: 93,
      calculatedAward: 'Лауреат II степени',
      certificateStatus: 'ГОТОВ К ГЕНЕРАЦИИ',
    },
    {
      id: '4',
      code: 'EXP-2026-0077',
      participantName: 'Вокальный ансамбль «Созвучие»',
      nomination: 'Вокальные ансамбли',
      scoreAvg: 88,
      calculatedAward: 'Лауреат III степени',
      certificateStatus: 'ГОТОВ К ГЕНЕРАЦИИ',
    },
  ]);

  const handleCalculate = async () => {
    setLoading(true);

    try {
      await fetch('/api/admin/results/calculate', {
        method: 'POST',
      });
    } catch {
      // Mock submit
    }

    setTimeout(() => {
      setLoading(false);
      setCalculated(true);
      setData((prev) =>
        prev.map((item) => ({
          ...item,
          certificateStatus: 'ДИПЛОМЫ СГЕНЕРИРОВАНЫ С QR',
        }))
      );
    }, 600);
  };

  const handlePublish = () => {
    setPublished(true);
    alert('Официальные итоги сезона опубликованы на главном сайте и разосланы участникам!');
  };

  const columns: Column<CalculationRow>[] = [
    {
      key: 'code',
      header: 'Шифр заявки',
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'participantName',
      header: 'Участник',
      render: (r) => <span className="font-medium text-[#fcfcfc]">{r.participantName}</span>,
    },
    {
      key: 'nomination',
      header: 'Номинация',
      render: (r) => <span className="text-sm text-[#dedfee]">{r.nomination}</span>,
    },
    {
      key: 'scoreAvg',
      header: 'Итоговый балл',
      render: (r) => (
        <span className="font-mono text-sm font-bold text-[#6199f6]">
          {r.scoreAvg} <span className="text-xs text-[#757580]">/ 100</span>
        </span>
      ),
    },
    {
      key: 'calculatedAward',
      header: 'Распределенная степень',
      render: (r) => (
        <Badge
          status={r.scoreAvg === 100 ? 'GRAND_PRIX' : 'LAUREATE_1'}
          label={r.calculatedAward}
        />
      ),
    },
    {
      key: 'certificateStatus',
      header: 'Статус диплома',
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
            DELIBERATION ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            Расчёт итогов и распределение наград
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            Автоматическое сведение оценок жюри по 100-балльной шкале и генерация номеров дипломов
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
            {calculated ? 'Пересчитать итоги' : 'Рассчитать итоги и дипломы'}
          </Button>

          <Button
            variant="iris-action"
            size="md"
            disabled={!calculated}
            iconLeft={<Trophy className="w-4 h-4" />}
            onClick={handlePublish}
          >
            {published ? 'Итоги опубликованы' : 'Опубликовать итоги сезона'}
          </Button>
        </div>
      </div>

      <Table columns={columns} data={data} />
    </div>
  );
}
