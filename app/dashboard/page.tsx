'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlusCircle, FileText, Award, Eye, Clock, ArrowRight } from 'lucide-react';

export default function ParticipantDashboardPage() {
  const applications = [
    {
      id: 'app-001',
      code: 'EXP-2026-0042',
      nomination: 'Академический вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      participantName: 'Алексеева София (13 лет)',
      status: 'UNDER_REVIEW',
      statusText: 'На оценивании жюри',
      score: '—',
      date: '14.05.2026',
    },
    {
      id: 'app-002',
      code: 'EXP-2026-0089',
      nomination: 'Эстрадный вокал',
      category: 'Группа II (12–14 лет)',
      participantName: 'Алексеева София (13 лет)',
      status: 'EVALUATED',
      statusText: 'Оценена • 96/100',
      score: '96 / 100 (Лауреат I)',
      date: '02.05.2026',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            WORKSPACE // PARTICIPANT DESK
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            Здравствуйте, Елена Алексеевна
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            У вас 2 активные заявки в сезоне espressivo VOCAL 2026
          </p>
        </div>

        <Link href="/dashboard/applications/new">
          <Button variant="iris-action" size="md" iconLeft={<PlusCircle className="w-4 h-4" />}>
            Подать новую заявку
          </Button>
        </Link>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">Всего заявок</span>
            <FileText className="w-4 h-4 text-[#6199f6]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#fcfcfc]">2</div>
            <div className="text-xs text-[#757580] mt-1">Сезон espressivo VOCAL</div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">На оценивании</span>
            <Clock className="w-4 h-4 text-[#eab308]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#eab308]">1</div>
            <div className="text-xs text-[#757580] mt-1">Терминал жюри (слепой раунд)</div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">Завершено</span>
            <Award className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#22c55e]">1</div>
            <div className="text-xs text-[#757580] mt-1">Лауреат I степени</div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">Средний балл</span>
            <span className="text-[10px] font-mono text-[#6199f6] bg-[rgba(97,153,246,0.12)] px-2 py-0.5 rounded-full">
              MAX 100
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#6199f6]">96.0</div>
            <div className="text-xs text-[#757580] mt-1">Высокий результат</div>
          </div>
        </Card>
      </div>

      {/* Active Submissions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#fcfcfc]">
            Мои конкурсные заявки
          </h2>
          <Link
            href="/dashboard/applications"
            className="text-xs text-[#6199f6] hover:underline flex items-center gap-1 font-mono"
          >
            <span>Все заявки</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {applications.map((app) => (
            <Card
              key={app.id}
              interactive
              padding="md"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#6199f6]">
                    {app.code}
                  </span>
                  <Badge status={app.status} label={app.statusText} />
                </div>
                <h3 className="text-base font-medium text-[#fcfcfc]">
                  {app.nomination}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#a3a3b3]">
                  <span>{app.participantName}</span>
                  <span>•</span>
                  <span>{app.category}</span>
                  <span>•</span>
                  <span className="text-[#757580]">Подана {app.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {app.status === 'EVALUATED' && (
                  <Link href="/dashboard/certificates">
                    <Button variant="ghost" size="sm" iconLeft={<Award className="w-3.5 h-3.5" />}>
                      Диплом
                    </Button>
                  </Link>
                )}
                <Link href={`/dashboard/applications/${app.id}`}>
                  <Button variant="primary-vellum" size="sm" iconLeft={<Eye className="w-3.5 h-3.5" />}>
                    Просмотр
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Important Announcement Notice */}
      <Card
        padding="md"
        className="bg-gradient-to-r from-[rgba(24,24,38,0.9)] to-[rgba(10,10,19,0.9)] border-l-4 border-l-[#6199f6]"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-sm font-medium text-[#fcfcfc] mb-1">
              Регламент публикации официального реестра дипломов
            </h4>
            <p className="text-xs text-[#a3a3b3] max-w-2xl leading-relaxed">
              Окончательный расчет результатов и открытие доступа к скачиванию защищенных PDF-дипломов состоится 30 июня 2026. Вы получите уведомление на указанный email.
            </p>
          </div>
          <Link href="/dashboard/results" className="shrink-0">
            <Button variant="ghost" size="sm">
              Реестр наград
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
