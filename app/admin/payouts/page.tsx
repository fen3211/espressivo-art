'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Check, X, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

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
  const { dict } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [payouts, setPayouts] = useState<AdminPayoutRow[]>([
    {
      id: 'mock-1',
      requestId: 'REQ-2026-003',
      teacherName: 'Мария Александровна Смирнова',
      institution: 'ДМШ им. Гнесиных / Академия Вокала',
      amount: '5 000 ₽',
      bankDetails: 'ИНН 770123456789, Р/С 40802810900000001234, БИК 044525974',
      date: '15.05.2026 10:14',
      status: 'PENDING',
    },
    {
      id: 'mock-2',
      requestId: 'REQ-2026-002',
      teacherName: 'Петрова Марина Викторовна',
      institution: 'ДМШ № 1 г. Казань',
      amount: '3 200 ₽',
      bankDetails: 'Сбербанк: 40817810000001234567',
      date: '12.05.2026 16:30',
      status: 'APPROVED',
    },
  ]);

  const loadPayouts = async () => {
    try {
      const res = await fetch('/api/admin/payouts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPayouts(data.map((p: any) => ({
            id: p.id,
            requestId: p.requestId,
            teacherName: p.teacherName,
            institution: p.organization,
            amount: p.amount,
            bankDetails: p.bankDetails,
            date: p.date,
            status: p.status === 'REQUESTED' ? 'PENDING' : p.status,
          })));
        }
      }
    } catch (err) {
      console.error('Failed to load admin payouts:', err);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, []);

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      if (!id.startsWith('mock-')) {
        await fetch(`/api/admin/payouts/${id}/confirm`, {
          method: 'POST',
        });
      }
      setPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'APPROVED' } : p))
      );
    } catch (err) {
      console.error('Failed to approve payout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED' } : p))
    );
  };

  const columns: Column<AdminPayoutRow>[] = [
    {
      key: 'requestId',
      header: dict.admin.finance.tableHeaders.entryCode,
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.requestId}</span>,
    },
    {
      key: 'teacherName',
      header: dict.admin.payouts.tableHeaders.teacher,
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">{r.teacherName}</div>
          <div className="text-xs text-[#757580]">{r.institution}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: dict.admin.payouts.tableHeaders.amount,
      render: (r) => (
        <span className="font-mono text-sm font-bold text-[#22c55e]">
          {r.amount}
        </span>
      ),
    },
    {
      key: 'bankDetails',
      header: dict.admin.payouts.tableHeaders.bankDetails,
      render: (r) => <span className="text-xs font-mono text-[#dedfee]">{r.bankDetails}</span>,
    },
    {
      key: 'date',
      header: dict.teacher.tableHeaders.date,
      render: (r) => <span className="text-xs text-[#757580]">{r.date}</span>,
    },
    {
      key: 'status',
      header: dict.teacher.tableHeaders.status,
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: 'actions',
      header: dict.admin.payouts.tableHeaders.actions,
      align: 'right',
      render: (r) =>
        r.status === 'PENDING' ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="solid-ink"
              size="sm"
              loading={loading}
              className="!bg-[#22c55e] !border-[#22c55e] text-black font-semibold hover:!bg-[#16a34a]"
              iconLeft={<Check className="w-3.5 h-3.5" />}
              onClick={() => handleApprove(r.id)}
            >
              {dict.admin.payouts.approveBtn}
            </Button>
            <Button
              variant="danger-outline"
              size="sm"
              iconLeft={<X className="w-3.5 h-3.5" />}
              onClick={() => handleReject(r.id)}
            >
              {dict.admin.payouts.rejectBtn}
            </Button>
          </div>
        ) : (
          <span className="text-xs text-[#757580] italic">
            {dict.admin.payouts.decisionMade}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            FINANCIAL GOVERNANCE // 20% AFFILIATE
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            {dict.admin.payouts.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {dict.admin.payouts.subtitle}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconLeft={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={loadPayouts}
        >
          Обновить
        </Button>
      </div>

      <Card padding="none">
        <Table columns={columns} data={payouts} emptyText="Нет данных" />
      </Card>
    </div>
  );
}
