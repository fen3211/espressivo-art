'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Play, EyeOff, Eye, Search } from 'lucide-react';

interface JuryQueueRow extends Record<string, unknown> {
  id: string;
  code: string;
  participantMaskedRu: string;
  participantMaskedEn: string;
  participantRealRu: string;
  participantRealEn: string;
  nominationRu: string;
  nominationEn: string;
  categoryRu: string;
  categoryEn: string;
  repertoire: string;
  duration: string;
  status: string;
}

export default function JuryApplicationsQueuePage() {
  const { locale, dict } = useLanguage();
  const [blindMode, setBlindMode] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const queueData: JuryQueueRow[] = [
    {
      id: 'app-001',
      code: 'EXP-2026-0042',
      participantMaskedRu: 'Кандидат #0042 (Анонимно)',
      participantMaskedEn: 'Candidate #0042 (Anonymous)',
      participantRealRu: 'Алексеева София (ДШИ им. Чайковского)',
      participantRealEn: 'Sofia Alekseeva (Tchaikovsky Music School)',
      nominationRu: 'Академический вокал (Соло)',
      nominationEn: 'Academic Vocal (Solo)',
      categoryRu: 'Группа II (12–14 лет)',
      categoryEn: 'Group II (12–14 yrs)',
      repertoire: "G. Pergolesi — Canzona \"Se tu m'ami\"",
      duration: '3:30',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'app-003',
      code: 'EXP-2026-0155',
      participantMaskedRu: 'Кандидат #0155 (Анонимно)',
      participantMaskedEn: 'Candidate #0155 (Anonymous)',
      participantRealRu: 'Екатерина Морозова (МГДМШ им. Гнесиных)',
      participantRealEn: 'Ekaterina Morozova (Gnessin Music School)',
      nominationRu: 'Джазовый вокал',
      nominationEn: 'Jazz Vocal',
      categoryRu: 'Группа I (9–11 лет)',
      categoryEn: 'Group I (9–11 yrs)',
      repertoire: 'G. Gershwin — "Summertime"',
      duration: '4:10',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'app-004',
      code: 'EXP-2026-0201',
      participantMaskedRu: 'Кандидат #0201 (Анонимно)',
      participantMaskedEn: 'Candidate #0201 (Anonymous)',
      participantRealRu: 'Артур Вартанян (Ереванская спец. муз. школа)',
      participantRealEn: 'Artur Vardanyan (Yerevan Music School)',
      nominationRu: 'Эстрадный вокал (Соло)',
      nominationEn: 'Pop & Contemporary Vocal (Solo)',
      categoryRu: 'Группа III (15–17 лет)',
      categoryEn: 'Group III (15–17 yrs)',
      repertoire: 'F. Mercury — "Somebody to Love"',
      duration: '4:15',
      status: 'UNDER_REVIEW',
    },
    {
      id: 'app-002',
      code: 'EXP-2026-0089',
      participantMaskedRu: 'Кандидат #0089',
      participantMaskedEn: 'Candidate #0089',
      participantRealRu: 'Алексеева София',
      participantRealEn: 'Sofia Alekseeva',
      nominationRu: 'Эстрадный вокал (Соло)',
      nominationEn: 'Pop & Contemporary Vocal (Solo)',
      categoryRu: 'Группа II (12–14 лет)',
      categoryEn: 'Group II (12–14 yrs)',
      repertoire: 'I. Krutoy — "Love Resembling a Dream"',
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
      header: dict.jury.tableHeaders.entryCode,
      render: (r) => <span className="font-mono text-xs font-semibold text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'participant',
      header: locale === 'ru' ? 'Участник' : 'Participant',
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">
            {blindMode
              ? (locale === 'ru' ? r.participantMaskedRu : r.participantMaskedEn)
              : (locale === 'ru' ? r.participantRealRu : r.participantRealEn)}
          </div>
          <div className="text-xs text-[#757580]">
            {locale === 'ru' ? r.categoryRu : r.categoryEn}
          </div>
        </div>
      ),
    },
    {
      key: 'repertoire',
      header: locale === 'ru' ? 'Исполняемое произведение' : 'Repertoire',
      render: (r) => (
        <div>
          <div className="text-sm text-[#dedfee] font-medium">{r.repertoire}</div>
          <div className="text-xs text-[#757580]">
            {locale === 'ru' ? r.nominationRu : r.nominationEn}
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      header: dict.jury.tableHeaders.duration,
      render: (r) => (
        <span className="font-mono text-xs text-[#a3a3b3]">
          {r.duration} {locale === 'ru' ? 'мин' : 'min'}
        </span>
      ),
    },
    {
      key: 'status',
      header: dict.jury.tableHeaders.status,
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: 'actions',
      header: dict.jury.tableHeaders.action,
      align: 'right',
      render: (r) => (
        <Link href={`/jury/applications/${r.id}`}>
          <Button
            variant={r.status === 'UNDER_REVIEW' ? 'iris-action' : 'ghost'}
            size="sm"
            iconLeft={<Play className="w-3.5 h-3.5" />}
          >
            {r.status === 'UNDER_REVIEW'
              ? (locale === 'ru' ? 'Судейство' : 'Adjudicate')
              : (locale === 'ru' ? 'Пересмотр' : 'Review')}
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
            {locale === 'ru' ? 'Очередь оценивания конкурсных работ' : 'Adjudication Queue'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {locale === 'ru'
              ? 'Выберите выступление для перехода в кинематографичный видеотерминал жюри'
              : 'Select an entry to open the cinematic jury terminal'}
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
          <span>
            {blindMode
              ? (locale === 'ru' ? 'Слепой протокол: ВКЛЮЧЕН' : 'Blind Protocol: ACTIVE')
              : (locale === 'ru' ? 'Личные данные: ВИДИМЫ' : 'Personal Data: VISIBLE')}
          </span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#08080c] p-3 rounded-[10px] border border-[#2a2a32]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: dict.common.all },
            { id: 'PENDING', label: locale === 'ru' ? 'Ожидают оценки' : 'Pending Evaluation' },
            { id: 'EVALUATED', label: locale === 'ru' ? 'Завершенные' : 'Completed' },
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
            placeholder={
              locale === 'ru'
                ? 'Поиск по произведению или шифру...'
                : 'Search by piece or code...'
            }
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyText={dict.jury.emptyQueueTitle}
      />
    </div>
  );
}
