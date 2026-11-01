'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Check, X, Wallet, CheckCircle2 } from 'lucide-react';

interface AdminPayoutRow extends Record<string, unknown> {
  id: string;
  requestId: string;
  teacherName: string;
  institution: string;
  amount: string;
  bankDetails: string;
  date: string;
  status: string;
}

export default function AdminPayoutApprovalsPage() {
  const [payouts, setPayouts] = useState<AdminPayoutRow[]>([
    {
      id: '1',
      requestId: 'REQ-2026-003',
      teacherName: 'Иванова Анна Сергеевна',
      institution: 'ДШИ им. П.И. Чайковского',
      amount: '5 000 ₽',
      bankDetails: '2200 4500 8899 4421 (Т-Банк)',
      date: '15.05.2026 10:14',
      status: 'PENDING',
    },
    {
      id: '2',
      requestId: 'REQ-2026-002',
      teacherName: 'Петрова Марина Викторовна',
      institution: 'ДМШ № 1 г. Казань',
      amount: '3 200 ₽',
      bankDetails: 'Сбербанк: 40817810000001234567',
      date: '12.05.2026 16:30',
      status: 'APPROVED',
    },
    {
      id: '3',
      requestId: 'REQ-2026-001',
      teacherName: 'Иванова Анна Сергеевна',
      institution: 'ДШИ им. П.И. Чайковского',
      amount: '4 000 ₽',
      bankDetails: '2200 4500 8899 4421 (Т-Банк)',
      date: '20.04.2026 09:30',
      status: 'APPROVED',
    },
  ]);

  const handleApprove = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'APPROVED' } : p))
    );
    alert('Выплата одобрена и направлена в банковский реестр!');
  };

  const handleReject = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED' } : p))
    );
    alert('Запрос на выплату отклонен с уведомлением преподавателю');
  };

  const columns: Column<AdminPayoutRow>[] = [
    {
      key: 'requestId',
      header: 'Номер заявки',
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.requestId}</span>,
    },
    {
      key: 'teacherName',
      header: 'Преподаватель',
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">{r.teacherName}</div>
          <div className="text-xs text-[#757580]">{r.institution}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Сумма выплаты',
      render: (r) => (
        <span className="font-mono text-sm font-bold text-[#22c55e]">
          {r.amount}
        </span>
      ),
    },
    {
      key: 'bankDetails',
      header: 'Банковские реквизиты',
      render: (r) => <span className="text-xs font-mono text-[#dedfee]">{r.bankDetails}</span>,
    },
    {
      key: 'date',
      header: 'Дата запроса',
      render: (r) => <span className="text-xs text-[#757580]">{r.date}</span>,
    },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => (
        <Badge
          status={r.status === 'APPROVED' ? 'PAID' : r.status === 'REJECTED' ? 'REJECTED' : 'PAYMENT_PENDING'}
          label={r.status === 'APPROVED' ? 'Одобрено' : r.status === 'REJECTED' ? 'Отклонено' : 'На проверке'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Решение',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          {r.status === 'PENDING' ? (
            <>
              <Button
                variant="iris-action"
                size="sm"
                iconLeft={<Check className="w-3.5 h-3.5" />}
                onClick={() => handleApprove(r.id)}
              >
                Одобрить
              </Button>
              <Button
                variant="danger-outline"
                size="sm"
                iconLeft={<X className="w-3.5 h-3.5" />}
                onClick={() => handleReject(r.id)}
              >
                Отклонить
              </Button>
            </>
          ) : (
            <span className="text-xs text-[#757580] font-mono">Решение принято</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          PAYOUT APPROVALS
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          Одобрение выплат партнерских комиссий
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          Проверка реквизитов преподавателей и авторизация банковских переводов
        </p>
      </div>

      <Table columns={columns} data={payouts} />
    </div>
  );
}
