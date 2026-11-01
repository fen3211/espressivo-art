'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [currentBalance, setCurrentBalance] = useState(1500);
  const [amount, setAmount] = useState('1500');
  const [bankDetails, setBankDetails] = useState('ИНН 770123456789, Р/С 40802810900000001234, БИК 044525974');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [history, setHistory] = useState<PayoutRow[]>([
    {
      id: 'mock-1',
      requestId: 'PAY-2026-0012',
      date: '20.04.2026',
      amount: '4 000 ₽',
      methodRu: 'Р/С *1234',
      methodEn: 'Bank Account *1234',
      status: 'COMPLETED',
    },
  ]);

  const loadData = async () => {
    try {
      const [dashRes, payoutsRes] = await Promise.all([
        fetch('/api/teacher/dashboard'),
        fetch('/api/teacher/payouts'),
      ]);
      if (dashRes.ok) {
        const d = await dashRes.json();
        if (d.balance !== undefined) {
          setCurrentBalance(d.balance);
        }
        if (d.bankDetails) {
          setBankDetails(d.bankDetails);
        }
      }
      if (payoutsRes.ok) {
        const pList = await payoutsRes.json();
        if (Array.isArray(pList) && pList.length > 0) {
          setHistory(pList.map((p: any) => ({
            id: p.id,
            requestId: `PAY-${p.id.slice(0, 8).toUpperCase()}`,
            date: new Date(p.createdAt).toLocaleDateString('ru-RU'),
            amount: `${p.amount.toLocaleString('ru-RU')} ₽`,
            methodRu: p.bankDetails.slice(0, 30) + '...',
            methodEn: p.bankDetails.slice(0, 30) + '...',
            status: p.status,
          })));
        }
      }
    } catch (e) {
      console.error('Failed to load teacher payouts info:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/teacher/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          bankDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Ошибка создания запроса на выплату');
      } else {
        setSubmitted(true);
        setCurrentBalance((prev) => Math.max(0, prev - Number(amount)));
        setHistory((prev) => [
          {
            id: data.payoutRequest.id,
            requestId: `PAY-${data.payoutRequest.id.slice(0, 8).toUpperCase()}`,
            date: new Date().toLocaleDateString('ru-RU'),
            amount: `${Number(amount).toLocaleString('ru-RU')} ₽`,
            methodRu: bankDetails.slice(0, 30) + '...',
            methodEn: bankDetails.slice(0, 30) + '...',
            status: 'REQUESTED',
          },
          ...prev,
        ]);
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Сетевая ошибка при запросе выплаты');
    } finally {
      setLoading(false);
    }
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
          PAYOUT TERMINAL // 20% AFFILIATE
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          {dict.teacher.payout.modalTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          {dict.teacher.payout.modalDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <div className="text-xs text-[#757580] uppercase tracking-wider font-mono">
              {dict.teacher.payout.availableBalance}
            </div>
            <div className="text-3xl font-mono font-bold text-[#22c55e] mt-2">
              {currentBalance.toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-xs text-[#a3a3b3] mt-3 leading-relaxed">
              {dict.teacher.payout.minPayoutNotice}
            </p>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <h2 className="text-lg font-medium text-[#fcfcfc] mb-6">
              {dict.teacher.payout.modalTitle}
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {submitted ? (
              <div className="p-6 bg-[rgba(34,197,94,0.1)] border border-[#22c55e] rounded-[8px] text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="w-8 h-8 text-[#22c55e] mx-auto" />
                <h3 className="font-medium text-[#fcfcfc]">
                  {dict.teacher.payout.payoutSuccessNotice}
                </h3>
                <p className="text-xs text-[#a3a3b3]">
                  {dict.teacher.payout.modalDesc}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-4">
                <Input
                  label={dict.teacher.payout.amountLabel}
                  type="number"
                  min="1000"
                  max={String(currentBalance)}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <Input
                  label={dict.teacher.payout.paymentDetailsLabel}
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  helperText={dict.teacher.payout.modalDesc}
                  required
                />
                <Button
                  type="submit"
                  variant="iris-action"
                  size="md"
                  fullWidth
                  loading={loading}
                  disabled={currentBalance < 1000 || Number(amount) > currentBalance}
                >
                  {dict.teacher.payout.submitPayoutBtn}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium text-[#fcfcfc]">
          {locale === 'ru' ? 'История выплат' : 'Payout History'}
        </h2>
        <Card padding="none">
          <Table columns={columns} data={history} emptyText={locale === 'ru' ? 'История выплат пуста' : 'No payout requests yet'} />
        </Card>
      </div>
    </div>
  );
}
