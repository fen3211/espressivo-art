'use client';

import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Table, Column } from '@/components/ui/Table';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LedgerRow extends Record<string, unknown> {
  id: string;
  txNumber: string;
  date: string;
  descriptionRu: string;
  descriptionEn: string;
  grossAmount: string;
  rate: string;
  royaltyAmount: string;
  balanceAfter: string;
}

export default function TeacherEarningsPage() {
  const { locale, dict } = useLanguage();

  const ledger: LedgerRow[] = [
    {
      id: '1',
      txNumber: 'TX-2026-0891',
      date: '14.05.2026 14:22',
      descriptionRu: 'Комиссия 20% за заявку EXP-2026-0042 (София Алексеева)',
      descriptionEn: '20% commission for entry EXP-2026-0042 (Sofia Alekseeva)',
      grossAmount: '2 500 ₽',
      rate: '20%',
      royaltyAmount: '+500 ₽',
      balanceAfter: '12 500 ₽',
    },
    {
      id: '2',
      txNumber: 'TX-2026-0740',
      date: '02.05.2026 18:05',
      descriptionRu: 'Комиссия 20% за заявку EXP-2026-0089 (София Алексеева)',
      descriptionEn: '20% commission for entry EXP-2026-0089 (Sofia Alekseeva)',
      grossAmount: '2 500 ₽',
      rate: '20%',
      royaltyAmount: '+500 ₽',
      balanceAfter: '12 000 ₽',
    },
    {
      id: '3',
      txNumber: 'TX-2026-0612',
      date: '28.04.2026 11:17',
      descriptionRu: 'Комиссия 20% за заявку EXP-2026-0104 (Михаил Захаров)',
      descriptionEn: '20% commission for entry EXP-2026-0104 (Mikhail Zakharov)',
      grossAmount: '2 500 ₽',
      rate: '20%',
      royaltyAmount: '+500 ₽',
      balanceAfter: '11 500 ₽',
    },
    {
      id: '4',
      txNumber: 'TX-2026-0501',
      date: '20.04.2026 09:30',
      descriptionRu: 'Выплата на банковскую карту *4421 (Запрос PAY-0012)',
      descriptionEn: 'Payout to bank card *4421 (Request PAY-0012)',
      grossAmount: '—',
      rate: '—',
      royaltyAmount: '-4 000 ₽',
      balanceAfter: '11 000 ₽',
    },
  ];

  const columns: Column<LedgerRow>[] = [
    {
      key: 'txNumber',
      header: locale === 'ru' ? 'Транзакция' : 'Transaction',
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.txNumber}</span>,
    },
    {
      key: 'date',
      header: locale === 'ru' ? 'Дата и время' : 'Date & Time',
      render: (r) => <span className="text-xs text-[#757580]">{r.date}</span>,
    },
    {
      key: 'description',
      header: locale === 'ru' ? 'Назначение начисления' : 'Description',
      render: (r) => (
        <span className="text-xs text-[#fcfcfc]">
          {locale === 'ru' ? r.descriptionRu : r.descriptionEn}
        </span>
      ),
    },
    {
      key: 'grossAmount',
      header: locale === 'ru' ? 'Взнос ученика' : 'Entrant Fee',
      render: (r) => <span className="text-xs font-mono text-[#a3a3b3]">{r.grossAmount}</span>,
    },
    {
      key: 'royaltyAmount',
      header: locale === 'ru' ? 'Начислено (20%)' : 'Commission (20%)',
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
      header: locale === 'ru' ? 'Баланс счета' : 'Account Balance',
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
            {locale === 'ru' ? 'Журнал начислений и баланс' : 'Royalty Ledger & Balance'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {locale === 'ru'
              ? 'Детализированная история партнерских вознаграждений 20%'
              : 'Detailed transaction history of 20% affiliate payouts'}
          </p>
        </div>

        <Button
          variant="ghost"
          size="md"
          iconLeft={<Download className="w-4 h-4" />}
          onClick={() => alert(locale === 'ru' ? 'Экспорт финансового журнала (CSV)' : 'Exporting financial ledger (CSV)')}
        >
          {dict.admin.finance.exportCsvBtn}
        </Button>
      </div>

      <Table columns={columns} data={ledger} emptyText={dict.common.emptyData} />
    </div>
  );
}
