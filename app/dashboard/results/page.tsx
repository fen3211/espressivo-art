'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Trophy, Search, Award } from 'lucide-react';

interface ResultRow extends Record<string, unknown> {
  id: string;
  code: string;
  participantName: string;
  city: string;
  nomination: string;
  category: string;
  score: number;
  award: string;
  badgeStatus: string;
}

export default function ResultsPage() {
  const [search, setSearch] = useState('');

  const results: ResultRow[] = [
    {
      id: '1',
      code: 'EXP-2026-0012',
      participantName: 'Мария Васильева (16 лет)',
      city: 'Москва',
      nomination: 'Академический вокал (Соло)',
      category: 'Группа III (15–17 лет)',
      score: 100,
      award: 'Гран-при (Grand Prix)',
      badgeStatus: 'GRAND_PRIX',
    },
    {
      id: '2',
      code: 'EXP-2026-0089',
      participantName: 'Алексеева София (13 лет)',
      city: 'Санкт-Петербург',
      nomination: 'Эстрадный вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      score: 96,
      award: 'Лауреат I степени',
      badgeStatus: 'LAUREATE_1',
    },
    {
      id: '3',
      code: 'EXP-2026-0045',
      participantName: 'Дмитрий Соколов (10 лет)',
      city: 'Екатеринбург',
      nomination: 'Академический вокал (Соло)',
      category: 'Группа I (9–11 лет)',
      score: 93,
      award: 'Лауреат II степени',
      badgeStatus: 'LAUREATE_2',
    },
    {
      id: '4',
      code: 'EXP-2026-0077',
      participantName: 'Вокальный ансамбль «Созвучие»',
      city: 'Казань',
      nomination: 'Вокальные ансамбли',
      category: 'Группа III (15–17 лет)',
      score: 88,
      award: 'Лауреат III степени',
      badgeStatus: 'LAUREATE_3',
    },
  ];

  const filtered = results.filter(
    (r) =>
      r.participantName.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<ResultRow>[] = [
    {
      key: 'code',
      header: 'Шифр',
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'participantName',
      header: 'Участник',
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">{r.participantName}</div>
          <div className="text-xs text-[#757580]">{r.city} • {r.category}</div>
        </div>
      ),
    },
    {
      key: 'nomination',
      header: 'Номинация',
      render: (r) => <span className="text-sm text-[#dedfee]">{r.nomination}</span>,
    },
    {
      key: 'score',
      header: 'Балл жюри',
      render: (r) => (
        <span className="font-mono text-sm font-bold text-[#6199f6]">
          {r.score} <span className="text-[10px] text-[#757580]">/ 100</span>
        </span>
      ),
    },
    {
      key: 'award',
      header: 'Присужденная степень',
      render: (r) => <Badge status={r.badgeStatus} label={r.award} />,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          OFFICIAL PROTOCOL
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          Официальный реестр итогов и наград
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          Сезон espressivo VOCAL 2026 • Утверждено председателем жюри
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
            placeholder="Поиск по фамилии или шифру диплома..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} />
    </div>
  );
}
