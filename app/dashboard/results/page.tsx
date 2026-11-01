'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Search } from 'lucide-react';

interface ResultRow extends Record<string, unknown> {
  id: string;
  code: string;
  participantNameRu: string;
  participantNameEn: string;
  cityRu: string;
  cityEn: string;
  nominationRu: string;
  nominationEn: string;
  categoryRu: string;
  categoryEn: string;
  score: number;
  badgeStatus: string;
}

export default function ResultsPage() {
  const { locale, dict } = useLanguage();
  const [search, setSearch] = useState('');

  const results: ResultRow[] = [
    {
      id: '1',
      code: 'EXP-2026-0012',
      participantNameRu: 'Мария Васильева (16 лет)',
      participantNameEn: 'Maria Vasilyeva (16 yrs)',
      cityRu: 'Москва',
      cityEn: 'Moscow',
      nominationRu: 'Академический вокал (Соло)',
      nominationEn: 'Academic Vocal (Solo)',
      categoryRu: 'Группа III (15–17 лет)',
      categoryEn: 'Group III (15–17 yrs)',
      score: 100,
      badgeStatus: 'GRAND_PRIX',
    },
    {
      id: '2',
      code: 'EXP-2026-0089',
      participantNameRu: 'Алексеева София (13 лет)',
      participantNameEn: 'Sofia Alekseeva (13 yrs)',
      cityRu: 'Санкт-Петербург',
      cityEn: 'Saint Petersburg',
      nominationRu: 'Эстрадный вокал (Соло)',
      nominationEn: 'Pop & Contemporary Vocal (Solo)',
      categoryRu: 'Группа II (12–14 лет)',
      categoryEn: 'Group II (12–14 yrs)',
      score: 96,
      badgeStatus: 'LAUREATE_1',
    },
    {
      id: '3',
      code: 'EXP-2026-0045',
      participantNameRu: 'Дмитрий Соколов (10 лет)',
      participantNameEn: 'Dmitry Sokolov (10 yrs)',
      cityRu: 'Екатеринбург',
      cityEn: 'Yekaterinburg',
      nominationRu: 'Академический вокал (Соло)',
      nominationEn: 'Academic Vocal (Solo)',
      categoryRu: 'Группа I (9–11 лет)',
      categoryEn: 'Group I (9–11 yrs)',
      score: 93,
      badgeStatus: 'LAUREATE_2',
    },
    {
      id: '4',
      code: 'EXP-2026-0077',
      participantNameRu: 'Вокальный ансамбль «Созвучие»',
      participantNameEn: 'Vocal Ensemble "Harmonia"',
      cityRu: 'Казань',
      cityEn: 'Kazan',
      nominationRu: 'Вокальные ансамбли',
      nominationEn: 'Vocal Ensembles',
      categoryRu: 'Группа III (15–17 лет)',
      categoryEn: 'Group III (15–17 yrs)',
      score: 88,
      badgeStatus: 'LAUREATE_3',
    },
  ];

  const filtered = results.filter((r) => {
    const name = locale === 'ru' ? r.participantNameRu : r.participantNameEn;
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns: Column<ResultRow>[] = [
    {
      key: 'code',
      header: dict.admin.results.tableHeaders.code,
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'participantName',
      header: locale === 'ru' ? 'Участник' : 'Participant',
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">
            {locale === 'ru' ? r.participantNameRu : r.participantNameEn}
          </div>
          <div className="text-xs text-[#757580]">
            {locale === 'ru' ? r.cityRu : r.cityEn} • {locale === 'ru' ? r.categoryRu : r.categoryEn}
          </div>
        </div>
      ),
    },
    {
      key: 'nomination',
      header: dict.dashboard.tableHeaders.nomination,
      render: (r) => (
        <span className="text-sm text-[#dedfee]">
          {locale === 'ru' ? r.nominationRu : r.nominationEn}
        </span>
      ),
    },
    {
      key: 'score',
      header: dict.dashboard.tableHeaders.score,
      render: (r) => (
        <span className="font-mono text-sm font-bold text-[#6199f6]">
          {r.score} <span className="text-[10px] text-[#757580]">/ 100</span>
        </span>
      ),
    },
    {
      key: 'award',
      header: dict.admin.results.tableHeaders.calculatedAward,
      render: (r) => <Badge status={r.badgeStatus} />,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          OFFICIAL PROTOCOL
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          {locale === 'ru' ? 'Официальный реестр итогов и наград' : 'Official Results & Awards Registry'}
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          {locale === 'ru'
            ? 'Сезон espressivo VOCAL 2026 • Утверждено председателем жюри'
            : 'Season espressivo VOCAL 2026 • Verified by Jury Board'}
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 bg-[#08080c] p-3 rounded-[10px] border border-[#2a2a32]">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#757580] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              locale === 'ru'
                ? 'Поиск по фамилии или шифру диплома...'
                : 'Search by name or entry code...'
            }
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyText={locale === 'ru' ? 'Результаты не найдены' : 'No results found'}
      />
    </div>
  );
}
