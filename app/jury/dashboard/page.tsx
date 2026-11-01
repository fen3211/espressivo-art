'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckSquare, Play, Clock, EyeOff, Award, ArrowRight } from 'lucide-react';

export default function JuryDashboardPage() {
  const stats = {
    totalAssigned: 24,
    completed: 18,
    pending: 6,
    avgScore: 92.4,
  };

  const pendingEntries = [
    {
      id: 'app-001',
      code: 'ENTRY // EXP-2026-0042',
      nomination: 'Академический вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      repertoire: 'Дж. Перголези — Канцона "Se tu m\'ami"',
      duration: '3:30 мин',
    },
    {
      id: 'app-003',
      code: 'ENTRY // EXP-2026-0155',
      nomination: 'Джазовый вокал',
      category: 'Группа II (12–14 лет)',
      repertoire: 'Дж. Гершвин — "Summertime"',
      duration: '4:10 мин',
    },
  ];

  const progressPercent = Math.round((stats.completed / stats.totalAssigned) * 100);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            JURY CONTROL TERMINAL // SEASON 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            Проф. Вальтер Кауфманн
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            Председатель судейской коллегии • Раунд слепого прослушивания
          </p>
        </div>

        <Link href="/jury/applications/app-001">
          <Button variant="iris-action" size="md" iconLeft={<Play className="w-4 h-4" />}>
            Продолжить судейство (6 в очереди)
          </Button>
        </Link>
      </div>

      {/* Progress & KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Bar Card */}
        <Card padding="lg" className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#a3a3b3] uppercase font-mono">Прогресс проверки очереди:</span>
            <span className="font-mono text-[#6199f6] font-bold">
              {stats.completed} из {stats.totalAssigned} заявок ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-3 bg-[#040407] rounded-full overflow-hidden border border-[#2a2a32]">
            <div
              className="h-full bg-[#6199f6] rounded-full shadow-[0_0_12px_rgba(97,153,246,0.5)] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
            <div>
              <span className="text-[#757580] block">Осталось в очереди:</span>
              <span className="font-mono text-xl font-bold text-[#eab308]">{stats.pending}</span>
            </div>
            <div>
              <span className="text-[#757580] block">Оценено работ:</span>
              <span className="font-mono text-xl font-bold text-[#22c55e]">{stats.completed}</span>
            </div>
            <div>
              <span className="text-[#757580] block">Ваш средний балл:</span>
              <span className="font-mono text-xl font-bold text-[#6199f6]">{stats.avgScore}</span>
            </div>
          </div>
        </Card>

        {/* Blind Mode Banner */}
        <Card padding="lg" className="lg:col-span-4 flex flex-col justify-between bg-gradient-to-br from-[#181826] to-[#040407]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#6199f6]">
              <EyeOff className="w-4 h-4" />
              <span>ПРОТОКОЛ ЧИСТОТЫ ОЦЕНКИ</span>
            </div>
            <h3 className="text-base font-medium text-[#fcfcfc]">
              Слепое прослушивание активно
            </h3>
            <p className="text-xs text-[#a3a3b3] leading-relaxed">
              Фамилии и школы участников скрыты до завершения судейства. Оценивайте технику, строй и художественное исполнение.
            </p>
          </div>

          <div className="pt-4 border-t border-[#2a2a32] text-[10px] font-mono text-[#757580]">
            REG. EUR-CONSERVATORY-2026
          </div>
        </Card>
      </div>

      {/* Up Next in Queue */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#fcfcfc]">
            Следующие заявки в очереди на прослушивание
          </h2>
          <Link
            href="/jury/applications"
            className="text-xs text-[#6199f6] hover:underline flex items-center gap-1 font-mono"
          >
            <span>Вся очередь</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {pendingEntries.map((entry) => (
            <Card
              key={entry.id}
              interactive
              padding="md"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#6199f6]">
                    {entry.code}
                  </span>
                  <span className="text-[10px] font-mono bg-[#040407] border border-[#2a2a32] px-2 py-0.5 rounded-full text-[#a3a3b3]">
                    Хронометраж: {entry.duration}
                  </span>
                </div>
                <h3 className="text-base font-medium text-[#fcfcfc]">{entry.repertoire}</h3>
                <div className="text-xs text-[#757580]">
                  {entry.nomination} • {entry.category}
                </div>
              </div>

              <Link href={`/jury/applications/${entry.id}`}>
                <Button variant="iris-action" size="sm" iconLeft={<Play className="w-3.5 h-3.5" />}>
                  Открыть в терминале
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
