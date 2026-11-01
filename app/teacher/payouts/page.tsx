'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { CheckCircle2 } from 'lucide-react';

interface PayoutRow extends Record<string, unknown> {
  id: string;
  requestId: string;
  date: string;
  amount: string;
  methodRu: string;
  methodEn: string;
  status: string;
}

export default function TeacherPayoutsPage() {
  const { locale, dict } = useLanguage();
  const currentBalance = 12500;
  const [amount, setAmount] = useState('5000');
  const [bankDetails, setBankDetails] = useState('2200 4500 8899 4421 (Т-Банк, Иванова А.С.)');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const history: PayoutRow[] = [
    {
      id: '1',
      requestId: 'PAY-2026-0012',
      date: '20.04.2026',
      amount: '4 000 ₽',
      methodRu: 'Карта *4421',
      methodEn: 'Bank Card *4421',
      status: 'COMPLETED',
    },
    {
      id: '2',
      requestId: 'PAY-2026-0005',
      date: '10.03.2026',
      amount: '3 500 ₽',
      methodRu: 'Карта *4421',
      methodEn: 'Bank Card *4421',
      status: 'COMPLETED',
    },
  ];

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }, 600);
  };

  const columns: Column<PayoutRow>[] = [
    {
      key: 'requestId',
      header: locale === 'ru' ? 'Номер запроса' : 'Request ID',
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.requestId}</span>,
    },
    {
      key: 'date',
      header: dict.teacher.tableHeaders.date,
      render: (r) => <span className="text-xs text-[#757580]">{r.date}</span>,
    },
    {
      key: 'amount',
      header: dict.admin.payouts.tableHeaders.amount,
      render: (r) => <span className="font-mono text-sm font-bold text-[#fcfcfc]">{r.amount}</span>,
    },
    {
      key: 'method',
      header: dict.admin.payouts.tableHeaders.bankDetails,
      render: (r) => (
        <span className="text-xs text-[#dedfee]">
          {locale === 'ru' ? r.methodRu : r.methodEn}
        </span>
      ),
    },
    {
      key: 'status',
      header: dict.teacher.tableHeaders.status,
      render: (r) => <Badge status={r.status} />,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          PAYOUT TERMINAL
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          {locale === 'ru' ? 'Вывод партнерских средств' : 'Partner Royalty Payouts'}
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          {dict.teacher.payout.modalDesc}
        </p>
      </div>

      {/* Balance Card & Request Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <Card padding="lg" className="md:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs text-[#757580] uppercase font-mono block mb-1">
              {dict.teacher.payout.availableBalance}
            </span>
            <div className="text-3xl font-mono font-bold text-[#22c55e]">
              {currentBalance.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
            </div>
            <p className="text-xs text-[#a3a3b3] mt-2 leading-relaxed">
              {locale === 'ru'
                ? 'Выплаты обрабатываются финансовым отделом в течение 1–2 рабочих дней. Минимальная сумма вывода — 1 000 ₽.'
                : 'Payout requests are processed by the accounting department within 1–2 business days. Minimum payout is 1,000 ₽.'}
            </p>
          </div>

          <div className="p-3 rounded-[8px] bg-[#040407] border border-[#2a2a32] text-xs text-[#757580]">
            {locale === 'ru'
              ? 'Все выплаты сопровождаются формированием электронного фискального чека.'
              : 'All payouts are accompanied by official fiscal receipt generation.'}
          </div>
        </Card>

        <Card padding="lg" className="md:col-span-7">
          <form onSubmit={handleRequestPayout} className="space-y-4">
            <h2 className="text-base font-medium text-[#fcfcfc] border-b border-[#2a2a32] pb-3">
              {locale === 'ru' ? 'Новый запрос на вывод' : 'New Payout Request'}
            </h2>

            {submitted && (
              <div className="p-3 rounded-[8px] bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.4)] text-xs text-[#22c55e] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {locale === 'ru'
                    ? 'Запрос успешно отправлен в финансовый отдел.'
                    : 'Request successfully submitted to the accounting department.'}
                </span>
              </div>
            )}

            <Input
              label={locale === 'ru' ? 'Сумма вывода (рублей)' : 'Payout Amount (RUB)'}
              type="number"
              min="1000"
              max={currentBalance}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Input
              label={dict.teacher.payout.paymentDetailsLabel}
              required
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
            />

            <div className="pt-2">
              <Button
                variant="iris-action"
                fullWidth
                size="md"
                loading={loading}
                type="submit"
              >
                {locale === 'ru'
                  ? `Отправить запрос на вывод ${parseInt(amount || '0', 10).toLocaleString('ru-RU')} ₽`
                  : `Submit Payout Request ${parseInt(amount || '0', 10).toLocaleString('en-US')} ₽`}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-[#fcfcfc]">
          {locale === 'ru' ? 'История выплат' : 'Payout History'}
        </h2>
        <Table columns={columns} data={history} emptyText={dict.common.emptyData} />
      </div>
    </div>
  );
}
