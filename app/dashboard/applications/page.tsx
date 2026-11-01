'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { PlusCircle, Search, Filter, Eye } from 'lucide-react';

interface ApplicationRow extends Record<string, unknown> {
  id: string;
  code: string;
  participantName: string;
  nomination: string;
  category: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const rawData: ApplicationRow[] = [
    {
      id: 'app-001',
      code: 'EXP-2026-0042',
      participantName: 'Алексеева София (13 лет)',
      nomination: 'Академический вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      status: 'UNDER_REVIEW',
      paymentStatus: 'PAID',
      createdAt: '14.05.2026',
    },
    {
      id: 'app-002',
      code: 'EXP-2026-0089',
      participantName: 'Алексеева София (13 лет)',
      nomination: 'Эстрадный вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      status: 'EVALUATED',
      paymentStatus: 'PAID',
      createdAt: '02.05.2026',
    },
    {
      id: 'app-003',
      code: 'EXP-2026-0155',
      participantName: 'Алексеева София (13 лет)',
      nomination: 'Джазовый вокал',
      category: 'Группа II (12–14 лет)',
      status: 'PAYMENT_PENDING',
      paymentStatus: 'PENDING',
      createdAt: '22.05.2026',
    },
  ];

  const filteredData = rawData.filter((item) => {
    if (filter !== 'ALL' && item.status !== filter) return false;
    if (search && !item.participantName.toLowerCase().includes(search.toLowerCase()) && !item.code.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const columns: Column<ApplicationRow>[] = [
    {
      key: 'code',
      header: 'Шифр заявки',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#6199f6]">
          {row.code}
        </span>
      ),
    },
    {
      key: 'participantName',
      header: 'Участник',
      render: (row) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">{row.participantName}</div>
          <div className="text-xs text-[#757580]">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'nomination',
      header: 'Номинация',
      render: (row) => <span className="text-sm text-[#dedfee]">{row.nomination}</span>,
    },
    {
      key: 'status',
      header: 'Статус заявки',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'paymentStatus',
      header: 'Оплата',
      render: (row) => (
        <span className={`text-xs font-mono font-medium ${row.paymentStatus === 'PAID' ? 'text-[#22c55e]' : 'text-[#eab308]'}`}>
          {row.paymentStatus === 'PAID' ? 'Оплачено (2 500 ₽)' : 'Ожидает (2 500 ₽)'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Дата подачи',
      render: (row) => <span className="text-xs text-[#757580]">{row.createdAt}</span>,
    },
    {
      key: 'actions',
      header: 'Действия',
      align: 'right',
      render: (row) => (
        <Link href={`/dashboard/applications/${row.id}`}>
          <Button variant="ghost" size="sm" iconLeft={<Eye className="w-3.5 h-3.5" />}>
            Просмотр
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            SUBMISSION REPOSITORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            Реестр поданных заявок
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            Отслеживайте статус модерации, этап слепого прослушивания и оценки жюри
          </p>
        </div>

        <Link href="/dashboard/applications/new">
          <Button variant="iris-action" size="md" iconLeft={<PlusCircle className="w-4 h-4" />}>
            Подать новую заявку
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#08080c] p-3 rounded-[10px] border border-[#2a2a32]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'UNDER_REVIEW', 'EVALUATED', 'PAYMENT_PENDING'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#6199f6] text-[#0a0a13] font-bold shadow-[0_0_8px_rgba(97,153,246,0.3)]'
                  : 'text-[#a3a3b3] hover:text-[#fcfcfc] hover:bg-[#181826]'
              }`}
            >
              {tab === 'ALL'
                ? 'Все заявки'
                : tab === 'UNDER_REVIEW'
                ? 'На оценивании'
                : tab === 'EVALUATED'
                ? 'Оценены'
                : 'Ожидают оплаты'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#757580] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по шифру или имени..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      {/* Data Table */}
      <Table columns={columns} data={filteredData} emptyText="Заявок с выбранными параметрами не найдено" />
    </div>
  );
}
