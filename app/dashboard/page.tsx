'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PlusCircle, FileText, Award, Eye, Clock, ArrowRight } from 'lucide-react';

export default function ParticipantDashboardPage() {
  const { locale, dict } = useLanguage();

  const applications = [
    {
      id: 'app-001',
      code: 'EXP-2026-0042',
      nominationRu: 'Академический вокал (Соло)',
      nominationEn: 'Academic Vocal (Solo)',
      categoryRu: 'Группа II (12–14 лет)',
      categoryEn: 'Group II (12–14 yrs)',
      participantNameRu: 'Алексеева София (13 лет)',
      participantNameEn: 'Sofia Alekseeva (13 yrs)',
      status: 'UNDER_REVIEW',
      score: '—',
      date: '14.05.2026',
    },
    {
      id: 'app-002',
      code: 'EXP-2026-0089',
      nominationRu: 'Эстрадный вокал',
      nominationEn: 'Pop & Contemporary Vocal',
      categoryRu: 'Группа II (12–14 лет)',
      categoryEn: 'Group II (12–14 yrs)',
      participantNameRu: 'Алексеева София (13 лет)',
      participantNameEn: 'Sofia Alekseeva (13 yrs)',
      status: 'EVALUATED',
      score: '96 / 100',
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
            {dict.dashboard.welcome}, {locale === 'ru' ? 'Елена Алексеевна' : 'Elena Alekseeva'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {locale === 'ru'
              ? 'У вас 2 активные заявки в сезоне espressivo VOCAL 2026'
              : 'You have 2 active entries in espressivo VOCAL 2026'}
          </p>
        </div>

        <Link href="/dashboard/applications/new">
          <Button variant="iris-action" size="md" iconLeft={<PlusCircle className="w-4 h-4" />}>
            {dict.dashboard.newApplicationBtn}
          </Button>
        </Link>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">
              {locale === 'ru' ? 'Всего заявок' : 'Total Entries'}
            </span>
            <FileText className="w-4 h-4 text-[#6199f6]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#fcfcfc]">2</div>
            <div className="text-xs text-[#757580] mt-1">
              {locale === 'ru' ? 'Сезон espressivo VOCAL' : 'Season espressivo VOCAL'}
            </div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">
              {locale === 'ru' ? 'На оценивании' : 'Under Review'}
            </span>
            <Clock className="w-4 h-4 text-[#eab308]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#eab308]">1</div>
            <div className="text-xs text-[#757580] mt-1">
              {locale === 'ru' ? 'Терминал жюри (слепой раунд)' : 'Jury Terminal (Blind Round)'}
            </div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">
              {locale === 'ru' ? 'Завершено' : 'Completed'}
            </span>
            <Award className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#22c55e]">1</div>
            <div className="text-xs text-[#757580] mt-1">{dict.awards.LAUREATE_1}</div>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-[#a3a3b3] uppercase font-mono">
              {locale === 'ru' ? 'Средний балл' : 'Average Score'}
            </span>
            <span className="text-[10px] font-mono text-[#6199f6] bg-[rgba(97,153,246,0.12)] px-2 py-0.5 rounded-full">
              MAX 100
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-semibold text-[#6199f6]">96.0</div>
            <div className="text-xs text-[#757580] mt-1">
              {locale === 'ru' ? 'Высокий результат' : 'High Distinction'}
            </div>
          </div>
        </Card>
      </div>

      {/* Active Submissions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-[#fcfcfc]">
            {dict.dashboard.myApplicationsTitle}
          </h2>
          <Link
            href="/dashboard/applications"
            className="text-xs text-[#6199f6] hover:underline flex items-center gap-1 font-mono"
          >
            <span>{locale === 'ru' ? 'Все заявки' : 'All Entries'}</span>
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
                  <Badge status={app.status} />
                </div>
                <h3 className="text-base font-medium text-[#fcfcfc]">
                  {locale === 'ru' ? app.nominationRu : app.nominationEn}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#a3a3b3]">
                  <span>{locale === 'ru' ? app.participantNameRu : app.participantNameEn}</span>
                  <span>•</span>
                  <span>{locale === 'ru' ? app.categoryRu : app.categoryEn}</span>
                  <span>•</span>
                  <span className="text-[#757580]">
                    {locale === 'ru' ? 'Подана ' : 'Submitted '}
                    {app.date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {app.status === 'EVALUATED' && (
                  <Link href="/dashboard/certificates">
                    <Button variant="ghost" size="sm" iconLeft={<Award className="w-3.5 h-3.5" />}>
                      {dict.dashboard.tableHeaders.diploma}
                    </Button>
                  </Link>
                )}
                <Link href={`/dashboard/applications/${app.id}`}>
                  <Button variant="primary-vellum" size="sm" iconLeft={<Eye className="w-3.5 h-3.5" />}>
                    {dict.common.view}
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
              {locale === 'ru'
                ? 'Регламент публикации официального реестра дипломов'
                : 'Official Certificate Registry Publication Schedule'}
            </h4>
            <p className="text-xs text-[#a3a3b3] max-w-2xl leading-relaxed">
              {locale === 'ru'
                ? 'Окончательный расчет результатов и открытие доступа к скачиванию защищенных PDF-дипломов состоится 30 июня 2026. Вы получите уведомление на указанный email.'
                : 'Final result calculation and access to verified PDF certificate downloads will be released on June 30, 2026. You will receive an email notification.'}
            </p>
          </div>
          <Link href="/dashboard/results" className="shrink-0">
            <Button variant="ghost" size="sm">
              {locale === 'ru' ? 'Реестр наград' : 'Awards Registry'}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
