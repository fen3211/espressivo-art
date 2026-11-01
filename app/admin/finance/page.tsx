'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { DollarSign, Download, CreditCard, ShieldCheck } from 'lucide-react';

interface FinanceTxRow extends Record<string, unknown> {
  id: string;
  txId: string;
  appCode: string;
  payerName: string;
  grossAmount: string;
  teacherRoyalty: string;
  netRevenue: string;
  gatewayStatus: string;
  date: string;
}

export default function AdminFinancePage() {
  const transactions: FinanceTxRow[] = [
    {
      id: '1',
      txId: 'PAY-TX-9901',
      appCode: 'EXP-2026-0042',
      payerName: 'Алексеева Елена (Родитель)',
      grossAmount: '2 500 ₽',
      teacherRoyalty: '500 ₽ (Иванова А.С.)',
      netRevenue: '2 000 ₽',
      gatewayStatus: 'PAID',
      date: '14.05.2026 14:20',
    },
    {
      id: '2',
      txId: 'PAY-TX-9844',
      appCode: 'EXP-2026-0089',
      payerName: 'Алексеева Елена (Родитель)',
      grossAmount: '2 500 ₽',
      teacherRoyalty: '500 ₽ (Иванова А.С.)',
      netRevenue: '2 000 ₽',
      gatewayStatus: 'PAID',
      date: '02.05.2026 18:02',
    },
    {
      id: '3',
      txId: 'PAY-TX-9721',
      appCode: 'EXP-2026-0104',
      payerName: 'Захаров Дмитрий',
      grossAmount: '2 500 ₽',
      teacherRoyalty: '500 ₽ (Иванова А.С.)',
      netRevenue: '2 000 ₽',
      gatewayStatus: 'PAID',
      date: '28.04.2026 11:15',
    },
    {
      id: '4',
      txId: 'PAY-TX-9610',
      appCode: 'EXP-2026-0077',
      payerName: 'Смирнова Ольга',
      grossAmount: '4 000 ₽',
      teacherRoyalty: '800 ₽ (Петрова М.В.)',
      netRevenue: '3 200 ₽',
      gatewayStatus: 'PAID',
      date: '25.04.2026 10:44',
    },
  ];

  const columns: Column<FinanceTxRow>[] = [
    {
      key: 'txId',
      header: 'ID транзакции',
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.txId}</span>,
    },
    {
      key: 'appCode',
      header: 'Заявка',
      render: (r) => <span className="font-mono text-xs text-[#dedfee]">{r.appCode}</span>,
    },
    {
      key: 'payerName',
      header: 'Плательщик',
      render: (r) => <span className="text-xs font-medium text-[#fcfcfc]">{r.payerName}</span>,
    },
    {
      key: 'grossAmount',
      header: 'Взнос (Gross)',
      render: (r) => <span className="font-mono text-sm font-semibold text-[#fcfcfc]">{r.grossAmount}</span>,
    },
    {
      key: 'teacherRoyalty',
      header: 'Комиссия учителя (20%)',
      render: (r) => <span className="font-mono text-xs text-[#eab308]">{r.teacherRoyalty}</span>,
    },
    {
      key: 'netRevenue',
      header: 'Чистая выручка',
      render: (r) => <span className="font-mono text-sm font-bold text-[#22c55e]">{r.netRevenue}</span>,
    },
    {
      key: 'gatewayStatus',
      header: 'Статус эквайринга',
      render: () => <Badge status="PAID" label="Успешно" />,
    },
    {
      key: 'date',
      header: 'Дата',
      render: (r) => <span className="text-xs text-[#757580]">{r.date}</span>,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            FINANCIAL AUDIT // GATEWAY REGISTRY
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            Бухгалтерский реестр оплат и комиссий
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            Аудит поступлений регистрационных взносов и обязательств перед преподавателями
          </p>
        </div>

        <Button
          variant="ghost"
          size="md"
          iconLeft={<Download className="w-4 h-4" />}
          onClick={() => alert('Экспорт финансового отчета в Excel/CSV')}
        >
          Выгрузка для бухгалтерии (CSV)
        </Button>
      </div>

      <Table columns={columns} data={transactions} />
    </div>
  );
}
