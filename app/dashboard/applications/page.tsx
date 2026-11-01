'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { PlusCircle, Search, Eye } from 'lucide-react';

interface ApplicationRow extends Record<string, unknown> {
  id: string;
  code: string;
  participantNameRu: string;
  participantNameEn: string;
  nominationRu: string;
  nominationEn: string;
  categoryRu: string;
  categoryEn: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function ApplicationsPage() {
  const { locale, dict } = useLanguage();
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const [dataList, setDataList] = useState<ApplicationRow[]>([
    {
      id: 'EXP-2026-1004',
      code: 'EXP-2026-1004',
      participantNameRu: 'Дмитрий Орлов',
      participantNameEn: 'Dmitry Orlov',
      nominationRu: 'Академический вокал (Соло)',
      nominationEn: 'Academic Vocal (Solo)',
      categoryRu: 'Категория C (13–16 лет)',
      categoryEn: 'Category C (13–16 yrs)',
      status: 'UNDER_REVIEW',
      paymentStatus: 'PAID',
      createdAt: '14.05.2026',
    },
    {
      id: 'EXP-2026-1005',
      code: 'EXP-2026-1005',
      participantNameRu: 'Екатерина Воронова',
      participantNameEn: 'Ekaterina Voronova',
      nominationRu: 'Академический вокал (Соло)',
      nominationEn: 'Academic Vocal (Solo)',
      categoryRu: 'Категория D (17–25 лет)',
      categoryEn: 'Category D (17–25 yrs)',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      createdAt: '02.05.2026',
    },
  ]);

  useEffect(() => {
    async function fetchApps() {
      try {
        const res = await fetch('/api/applications');
        if (res.ok) {
          const apps = await res.json();
          if (Array.isArray(apps) && apps.length > 0) {
            setDataList(apps.map((a: any) => ({
              id: a.id,
              code: a.code,
              participantNameRu: a.participantName,
              participantNameEn: a.participantName,
              nominationRu: a.nomination?.titleRu || 'Вокал',
              nominationEn: a.nomination?.titleEn || 'Vocal',
              categoryRu: a.ageCategory?.titleRu || 'Категория',
              categoryEn: a.ageCategory?.titleEn || 'Category',
              status: a.status,
              paymentStatus: a.paymentStatus,
              createdAt: new Date(a.createdAt).toLocaleDateString('ru-RU'),
            })));
          }
        }
      } catch (e) {
        console.error('Failed to load applications from API:', e);
      }
    }
    fetchApps();
  }, []);

  const rawData = dataList;

  const filteredData = rawData.filter((item) => {
    if (filter !== 'ALL' && item.status !== filter) return false;
    const name = locale === 'ru' ? item.participantNameRu : item.participantNameEn;
    if (search && !name.toLowerCase().includes(search.toLowerCase()) && !item.code.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const columns: Column<ApplicationRow>[] = [
    {
      key: 'code',
      header: dict.dashboard.tableHeaders.code,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#6199f6]">
          {row.code}
        </span>
      ),
    },
    {
      key: 'participantName',
      header: locale === 'ru' ? 'Участник' : 'Participant',
      render: (row) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">
            {locale === 'ru' ? row.participantNameRu : row.participantNameEn}
          </div>
          <div className="text-xs text-[#757580]">
            {locale === 'ru' ? row.categoryRu : row.categoryEn}
          </div>
        </div>
      ),
    },
    {
      key: 'nomination',
      header: dict.dashboard.tableHeaders.nomination,
      render: (row) => (
        <span className="text-sm text-[#dedfee]">
          {locale === 'ru' ? row.nominationRu : row.nominationEn}
        </span>
      ),
    },
    {
      key: 'status',
      header: dict.dashboard.tableHeaders.status,
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'paymentStatus',
      header: locale === 'ru' ? 'Оплата' : 'Payment',
      render: (row) => (
        <span className={`text-xs font-mono font-medium ${row.paymentStatus === 'PAID' ? 'text-[#22c55e]' : 'text-[#eab308]'}`}>
          {row.paymentStatus === 'PAID'
            ? (locale === 'ru' ? 'Оплачено (2 500 ₽)' : 'Paid (2,500 ₽)')
            : (locale === 'ru' ? 'Ожидает (2 500 ₽)' : 'Pending (2,500 ₽)')}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: dict.dashboard.details.submittedAt,
      render: (row) => <span className="text-xs text-[#757580]">{row.createdAt}</span>,
    },
    {
      key: 'actions',
      header: dict.dashboard.tableHeaders.actions,
      align: 'right',
      render: (row) => (
        <Link href={`/dashboard/applications/${row.id}`}>
          <Button variant="ghost" size="sm" iconLeft={<Eye className="w-3.5 h-3.5" />}>
            {dict.common.view}
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
            {locale === 'ru' ? 'Реестр поданных заявок' : 'Submission Registry'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {locale === 'ru'
              ? 'Отслеживайте статус модерации, этап слепого прослушивания и оценки жюри'
              : 'Track moderation status, blind audition stages, and jury scores'}
          </p>
        </div>

        <Link href="/dashboard/applications/new">
          <Button variant="iris-action" size="md" iconLeft={<PlusCircle className="w-4 h-4" />}>
            {dict.dashboard.newApplicationBtn}
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#08080c] p-3 rounded-[10px] border border-[#2a2a32]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: dict.common.all },
            { id: 'UNDER_REVIEW', label: dict.statuses.UNDER_REVIEW },
            { id: 'EVALUATED', label: dict.statuses.EVALUATED },
            { id: 'PAYMENT_PENDING', label: dict.statuses.PAYMENT_PENDING },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#6199f6] text-[#0a0a13] font-bold shadow-[0_0_8px_rgba(97,153,246,0.3)]'
                  : 'text-[#a3a3b3] hover:text-[#fcfcfc] hover:bg-[#181826]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#757580] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === 'ru' ? 'Поиск по шифру или имени...' : 'Search by code or name...'}
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      {/* Data Table */}
      <Table
        columns={columns}
        data={filteredData}
        emptyText={
          locale === 'ru'
            ? 'Заявок с выбранными параметрами не найдено'
            : 'No applications found matching criteria'
        }
      />
    </div>
  );
}
