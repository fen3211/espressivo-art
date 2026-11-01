'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Play, EyeOff, Eye, Search, Filter } from 'lucide-react';

interface JuryQueueRow extends Record<string, unknown> {
  id: string;
  code: string;
  participantMasked: string;
  participantReal: string;
  nomination: string;
  category: string;
  repertoire: string;
  duration: string;
  status: string;
}

export default function JuryApplicationsQueuePage() {
  const [blindMode, setBlindMode] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const queueData: JuryQueueRow[] = [
    {
      id: 'app-001',
      code: 'EXP-2026-0042',
      participantMasked: 'Кандидат #0042 (Анонимно)',
      participantReal: 'Алексеева София (ДШИ им. Чайковского)',
      nomination: 'Академический вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      repertoire: 'Дж. Перголези — Канцона "Se tu m\'ami"',
      duration: '3:30',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'app-003',
      code: 'EXP-2026-0155',
      participantMasked: 'Кандидат #0155 (Анонимно)',
      participantReal: 'Екатерина Морозова (МГДМШ им. Гнесиных)',
      nomination: 'Джазовый вокал',
      category: 'Группа I (9–11 лет)',
      repertoire: 'Дж. Гершвин — "Summertime"',
      duration: '4:10',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'app-004',
      code: 'EXP-2026-0201',
      participantMasked: 'Кандидат #0201 (Анонимно)',
      participantReal: 'Артур Вартанян (Ереванская спец. муз. школа)',
      nomination: 'Эстрадный вокал (Соло)',
      category: 'Группа III (15–17 лет)',
      repertoire: 'F. Mercury — "Somebody to Love"',
      duration: '4:15',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'app-002',
      code: 'EXP-2026-0089',
      participantMasked: 'Кандидат #0089',
      participantReal: 'Алексеева София',
      nomination: 'Эстрадный вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      repertoire: 'И. Крутой — "Любовь, похожая на сон"',
      duration: '3:45',
      status: 'EVALUATED',
    },
  ];

  const filtered = queueData.filter((item) => {
    if (filter === 'PENDING' && item.status !== 'UNDER_REVIEW') return false;
    if (filter === 'EVALUATED' && item.status !== 'EVALUATED') return false;
    if (search && !item.repertoire.toLowerCase().includes(search.toLowerCase()) && !item.code.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const columns: Column<JuryQueueRow>[] = [
    {
      key: 'code',
      header: 'Шифр заявки',
      render: (r) => <span className="font-mono text-xs font-semibold text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'participant',
      header: 'Участник',
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">
            {blindMode ? r.participantMasked : r.participantReal}
          </div>
          <div className="text-xs text-[#757580]">{r.category}</div>
        </div>
      ),
    },
    {
      key: 'repertoire',
      header: 'Исполняемое произведение',
      render: (r) => (
        <div>
          <div className="text-sm text-[#dedfee] font-medium">{r.repertoire}</div>
          <div className="text-xs text-[#757580]">{r.nomination}</div>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Хронометраж',
      render: (r) => <span className="font-mono text-xs text-[#a3a3b3]">{r.duration} мин</span>,
    },
    {
      key: 'status',
      header: 'Статус',
      render: (r) => (
        <Badge
          status={r.status}
          label={r.status === 'UNDER_REVIEW' ? 'Требует оценки' : 'Оценено'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Действия',
      align: 'right',
      render: (r) => (
        <Link href={`/jury/applications/${r.id}`}>
          <Button
            variant={r.status === 'UNDER_REVIEW' ? 'iris-action' : 'ghost'}
            size="sm"
            iconLeft={<Play className="w-3.5 h-3.5" />}
          >
            {r.status === 'UNDER_REVIEW' ? 'Судейство' : 'Пересмотр'}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            QUEUE MANAGEMENT // 100 PTS RUBRIC
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            Очередь оценивания конкурсных работ
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            Выберите выступление для перехода в кинематографичный видеотерминал жюри
          </p>
        </div>

        {/* Blind mode switch */}
        <button
          type="button"
          onClick={() => setBlindMode(!blindMode)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer ${
            blindMode
              ? 'bg-[#181826] text-[#6199f6] border border-[#6199f6] shadow-[0_0_12px_rgba(97,153,246,0.25)]'
              : 'bg-[#08080c] text-[#757580] border border-[#2a2a32]'
          }`}
        >
          {blindMode ? <EyeOff className="w-4 h-4 text-[#6199f6]" /> : <Eye className="w-4 h-4" />}
          <span>{blindMode ? 'Слепой протокол: ВКЛЮЧЕН' : 'Личные данные: ВИДИМЫ'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#08080c] p-3 rounded-[10px] border border-[#2a2a32]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Все заявки' },
            { id: 'PENDING', label: 'Ожидают оценки' },
            { id: 'EVALUATED', label: 'Завершенные' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#6199f6] text-[#0a0a13] font-bold'
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
            placeholder="Поиск по произведению или шифру..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} />
    </div>
  );
}
