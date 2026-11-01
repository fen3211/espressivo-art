'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Coins, Download, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LedgerRow extends Record<string, unknown> {
  id: string;
  txNumber: string;
  date: string;
  description: string;
  grossAmount: string;
  rate: string;
  royaltyAmount: string;
  balanceAfter: string;
}

export default function TeacherEarningsPage() {
  const ledger: LedgerRow[] = [
    {
      id: '1',
      txNumber: 'TX-2026-0891',
      date: '14.05.2026 14:22',
      description: 'Комиссия 20% за заявку EXP-2026-0042 (София Алексеева)',
      grossAmount: '2 500 ₽',
      rate: '20%',
      royaltyAmount: '+500 ₽',
      balanceAfter: '12 500 ₽',
    },
    {
      id: '2',
      txNumber: 'TX-2026-0740',
      date: '02.05.2026 18:05',
      description: 'Комиссия 20% за заявку EXP-2026-0089 (София Алексеева)',
      grossAmount: '2 500 ₽',
      rate: '20%',
      royaltyAmount: '+500 ₽',
      balanceAfter: '12 000 ₽',
    },
    {
      id: '3',
      txNumber: 'TX-2026-0612',
      date: '28.04.2026 11:17',
      description: 'Комиссия 20% за заявку EXP-2026-0104 (Михаил Захаров)',
      grossAmount: '2 500 ₽',
      rate: '20%',
      royaltyAmount: '+500 ₽',
      balanceAfter: '11 500 ₽',
    },
    {
      id: '4',
      txNumber: 'TX-2026-0501',
      date: '20.04.2026 09:30',
      description: 'Выплата на банковскую карту *4421 (Запрос PAY-0012)',
      grossAmount: '—',
      rate: '—',
      royaltyAmount: '-4 000 ₽',
      balanceAfter: '11 000 ₽',
    },
  ];

  const columns: Column<LedgerRow>[] = [
    {
      key: 'txNumber',
      header: 'Транзакция',
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.txNumber}</span>,
    },
    {
      key: 'date',
      header: 'Дата и время',
      render: (r) => <span className="text-xs text-[#757580]">{r.date}</span>,
    },
    {
      key: 'description',
      header: 'Назначение начисления',
      render: (r) => <span className="text-xs text-[#fcfcfc]">{r.description}</span>,
    },
    {
      key: 'grossAmount',
      header: 'Взнос ученика',
      render: (r) => <span className="text-xs font-mono text-[#a3a3b3]">{r.grossAmount}</span>,
    },
    {
      key: 'royaltyAmount',
      header: 'Начислено (20%)',
      render: (r) => (
        <span
          className={`font-mono text-sm font-semibold ${
            r.royaltyAmount.startsWith('+') ? 'text-[#22c55e]' : 'text-red-400'
          }`}
        >
          {r.royaltyAmount}
        </span>
      ),
    },
    {
      key: 'balanceAfter',
      header: 'Баланс счета',
      render: (r) => <span className="font-mono text-xs font-bold text-[#fcfcfc]">{r.balanceAfter}</span>,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            FINANCIAL AUDIT
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            Журнал начислений и баланс
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            Детализированная история партнерских вознаграждений 20%
          </p>
        </div>

        <Button
          variant="ghost"
          size="md"
          iconLeft={<Download className="w-4 h-4" />}
          onClick={() => alert('Экспорт финансового журнала (CSV)')}
        >
          Экспорт выписки (CSV)
        </Button>
      </div>

      <Table columns={columns} data={ledger} />
    </div>
  );
}
