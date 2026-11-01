'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Search } from 'lucide-react';

interface StudentRow extends Record<string, unknown> {
  id: string;
  code: string;
  studentName: string;
  nomination: string;
  category: string;
  applicationStatus: string;
  paymentStatus: string;
  fee: number;
  commission: number;
  registeredAt: string;
}

export default function TeacherParticipantsPage() {
  const [search, setSearch] = useState('');

  const students: StudentRow[] = [
    {
      id: '1',
      code: 'EXP-2026-0042',
      studentName: 'София Алексеева (13 лет)',
      nomination: 'Академический вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      applicationStatus: 'UNDER_REVIEW',
      paymentStatus: 'PAID',
      fee: 2500,
      commission: 500,
      registeredAt: '14.05.2026',
    },
    {
      id: '2',
      code: 'EXP-2026-0089',
      studentName: 'София Алексеева (13 лет)',
      nomination: 'Эстрадный вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      applicationStatus: 'EVALUATED',
      paymentStatus: 'PAID',
      fee: 2500,
      commission: 500,
      registeredAt: '02.05.2026',
    },
    {
      id: '3',
      code: 'EXP-2026-0104',
      studentName: 'Михаил Захаров (15 лет)',
      nomination: 'Эстрадный вокал (Соло)',
      category: 'Группа III (15–17 лет)',
      applicationStatus: 'EVALUATED',
      paymentStatus: 'PAID',
      fee: 2500,
      commission: 500,
      registeredAt: '28.04.2026',
    },
    {
      id: '4',
      code: 'EXP-2026-0155',
      studentName: 'Екатерина Морозова (9 лет)',
      nomination: 'Джазовый вокал',
      category: 'Группа I (9–11 лет)',
      applicationStatus: 'PAYMENT_PENDING',
      paymentStatus: 'PENDING',
      fee: 2500,
      commission: 500,
      registeredAt: '20.05.2026',
    },
  ];

  const filtered = students.filter((s) =>
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<StudentRow>[] = [
    {
      key: 'code',
      header: 'Шифр заявки',
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'studentName',
      header: 'Ученик',
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">{r.studentName}</div>
          <div className="text-xs text-[#757580]">{r.category}</div>
        </div>
      ),
    },
    {
      key: 'nomination',
      header: 'Номинация',
      render: (r) => <span className="text-sm text-[#dedfee]">{r.nomination}</span>,
    },
    {
      key: 'paymentStatus',
      header: 'Статус оплаты',
      render: (r) => (
        <Badge
          status={r.paymentStatus === 'PAID' ? 'PAID' : 'PAYMENT_PENDING'}
          label={r.paymentStatus === 'PAID' ? 'Оплачено' : 'Ожидает оплаты'}
        />
      ),
    },
    {
      key: 'commission',
      header: 'Ваш бонус (20%)',
      render: (r) => (
        <span className={`font-mono text-sm font-semibold ${r.paymentStatus === 'PAID' ? 'text-[#22c55e]' : 'text-[#757580]'}`}>
          +{r.commission} ₽
        </span>
      ),
    },
    {
      key: 'registeredAt',
      header: 'Дата подачи',
      render: (r) => <span className="text-xs text-[#757580]">{r.registeredAt}</span>,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          STUDENT REGISTRY
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          Мои ученики и заявки
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          Реестр заявок, оформленных по вашему реферальному коду
        </p>
      </div>

      <div className="flex items-center gap-4 bg-[#08080c] p-3 rounded-[10px] border border-[#2a2a32]">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#757580] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени ученика или шифру..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} />
    </div>
  );
}
