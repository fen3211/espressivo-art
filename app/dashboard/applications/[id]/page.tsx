'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProtectedVideoPlayer } from '@/components/video/ProtectedVideoPlayer';
import { Award, ArrowLeft, CreditCard, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || 'app-001';
  const { locale, dict } = useLanguage();

  const isEvaluated = id === 'app-002';
  const isPendingPayment = id === 'app-003';

  const appData = {
    id,
    code: id === 'app-002' ? 'EXP-2026-0089' : id === 'app-003' ? 'EXP-2026-0155' : 'EXP-2026-0042',
    status: isEvaluated ? 'EVALUATED' : isPendingPayment ? 'PAYMENT_PENDING' : 'UNDER_REVIEW',
    participantNameRu: 'Алексеева София Андреевна',
    participantNameEn: 'Sofia Alekseeva',
    birthDateRu: '15.04.2012 (13 лет)',
    birthDateEn: '15.04.2012 (13 yrs)',
    nominationRu: 'Академический вокал (Соло)',
    nominationEn: 'Academic Vocal (Solo)',
    categoryRu: 'Группа II (12–14 лет)',
    categoryEn: 'Group II (12–14 yrs)',
    teacherNameRu: 'Иванова Анна Сергеевна',
    teacherNameEn: 'Anna Ivanova',
    institutionRu: 'ДШИ им. П.И. Чайковского',
    institutionEn: 'Tchaikovsky School of Music',
    repertoire: "G. Pergolesi — Se tu m'ami, se sospiri",
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    scores: isEvaluated
      ? {
          technique: 24,
          musicality: 25,
          artistry: 24,
          repertoire: 23,
          total: 96,
          award: dict.awards.LAUREATE_1,
          juryReviewRu:
            'Великолепное владение кантиленой и чистота интонирования в среднем регистре. Прекрасное ощущение барочной фразировки. Рекомендуется обратить внимание на опору дыхания в верхних кульминационных нотах.',
          juryReviewEn:
            'Superb cantilena control and intonational purity in the middle register. Excellent sense of Baroque phrasing. Pay close attention to breath support on peak high notes.',
          juryAuthorRu: 'Проф. Вальтер Кауфманн (Венская государственная опера)',
          juryAuthorEn: 'Prof. Walter Kaufmann (Vienna State Opera)',
        }
      : null,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            <Link href="/dashboard/applications" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{dict.dashboard.details.backToList}</span>
            </Link>
            <span>/</span>
            <span>{appData.code}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
              {locale === 'ru' ? 'Заявка' : 'Entry'} {appData.code}
            </h1>
            <Badge status={appData.status} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEvaluated && (
            <Link href="/dashboard/certificates">
              <Button variant="iris-action" size="md" iconLeft={<Award className="w-4 h-4" />}>
                {dict.dashboard.details.downloadDiploma}
              </Button>
            </Link>
          )}

          {isPendingPayment && (
            <Button
              variant="iris-action"
              size="md"
              iconLeft={<CreditCard className="w-4 h-4" />}
              onClick={() => alert(locale === 'ru' ? 'Переход к безопасному шлюзу оплаты 2 500 ₽' : 'Redirecting to payment gateway 2,500 ₽')}
            >
              {locale === 'ru' ? 'Оплатить взнос (2 500 ₽)' : 'Pay Entry Fee (2,500 ₽)'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Video Player + Participant Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Video & Review */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <h2 className="text-sm font-medium text-[#a3a3b3] uppercase font-mono mb-2">
              {dict.dashboard.details.performanceVideo}
            </h2>
            <ProtectedVideoPlayer
              videoUrl={appData.videoUrl}
              title={appData.repertoire}
              participantCode={appData.code}
            />
          </div>

          {/* Jury Review Block if Evaluated */}
          {appData.scores ? (
            <Card padding="lg" className="border-l-4 border-l-[#6199f6] space-y-6">
              <div className="flex justify-between items-center border-b border-[#2a2a32] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6199f6]">
                    {locale === 'ru' ? 'РЕЗУЛЬТАТЫ СУДЕЙСТВА' : 'ADJUDICATION RESULTS'}
                  </span>
                  <h3 className="text-xl font-medium text-[#fcfcfc]">
                    {appData.scores.award}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[#6199f6]">
                    {appData.scores.total} <span className="text-sm text-[#757580]">/ 100</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#22c55e]">
                    {locale === 'ru' ? 'ИТОГОВЫЙ БАЛЛ' : 'FINAL SCORE'}
                  </div>
                </div>
              </div>

              {/* 4 Rubric Criteria */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-[8px] bg-[#040407] border border-[#2a2a32]">
                  <div className="text-[10px] text-[#757580] uppercase font-mono">
                    {locale === 'ru' ? 'Техника' : 'Technique'}
                  </div>
                  <div className="text-lg font-mono text-[#fcfcfc] mt-1">{appData.scores.technique} / 25</div>
                </div>
                <div className="p-3 rounded-[8px] bg-[#040407] border border-[#2a2a32]">
                  <div className="text-[10px] text-[#757580] uppercase font-mono">
                    {locale === 'ru' ? 'Музыкальность' : 'Musicality'}
                  </div>
                  <div className="text-lg font-mono text-[#fcfcfc] mt-1">{appData.scores.musicality} / 25</div>
                </div>
                <div className="p-3 rounded-[8px] bg-[#040407] border border-[#2a2a32]">
                  <div className="text-[10px] text-[#757580] uppercase font-mono">
                    {locale === 'ru' ? 'Артистизм' : 'Artistry'}
                  </div>
                  <div className="text-lg font-mono text-[#fcfcfc] mt-1">{appData.scores.artistry} / 25</div>
                </div>
                <div className="p-3 rounded-[8px] bg-[#040407] border border-[#2a2a32]">
                  <div className="text-[10px] text-[#757580] uppercase font-mono">
                    {locale === 'ru' ? 'Сложность' : 'Complexity'}
                  </div>
                  <div className="text-lg font-mono text-[#fcfcfc] mt-1">{appData.scores.repertoire} / 25</div>
                </div>
              </div>

              {/* Written Critique */}
              <div className="space-y-2 pt-2 border-t border-[#2a2a32]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#a3a3b3]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#6199f6]" />
                  <span>
                    {dict.dashboard.details.juryComments}
                  </span>
                </div>
                <p className="text-sm text-[#dedfee] italic bg-[#08080c] p-4 rounded-[8px] border border-[#2a2a32] leading-relaxed">
                  «{locale === 'ru' ? appData.scores.juryReviewRu : appData.scores.juryReviewEn}»
                </p>
                <div className="text-xs text-[#757580] text-right font-medium">
                  {locale === 'ru' ? appData.scores.juryAuthorRu : appData.scores.juryAuthorEn}
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="md" className="flex items-center gap-4 bg-[#08080c]">
              <div className="w-10 h-10 rounded-full bg-[rgba(97,153,246,0.12)] border border-[#6199f6] flex items-center justify-center text-[#6199f6] shrink-0 animate-pulse">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="text-[#fcfcfc] font-medium">
                  {locale === 'ru'
                    ? 'Заявка находится в очереди слепого прослушивания'
                    : 'Application is currently in the blind audition queue'}
                </div>
                <div className="text-[#757580] mt-0.5">
                  {locale === 'ru'
                    ? 'Баллы и письменная рецензия станут доступны сразу после завершения раунда судейства.'
                    : 'Scores and written critique will become accessible immediately upon adjudication completion.'}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Entry Metadata Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-medium text-[#fcfcfc] border-b border-[#2a2a32] pb-3">
              {locale === 'ru' ? 'Паспорт конкурсной заявки' : 'Application Passport'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#757580] block">{locale === 'ru' ? 'Участник:' : 'Entrant:'}</span>
                <span className="text-sm font-medium text-[#fcfcfc]">
                  {locale === 'ru' ? appData.participantNameRu : appData.participantNameEn}
                </span>
                <span className="text-[#a3a3b3] block">
                  {locale === 'ru' ? appData.birthDateRu : appData.birthDateEn}
                </span>
              </div>

              <div>
                <span className="text-[#757580] block">{locale === 'ru' ? 'Номинация:' : 'Nomination:'}</span>
                <span className="text-[#dedfee] font-medium">
                  {locale === 'ru' ? appData.nominationRu : appData.nominationEn}
                </span>
              </div>

              <div>
                <span className="text-[#757580] block">{locale === 'ru' ? 'Возрастная категория:' : 'Age Category:'}</span>
                <span className="text-[#dedfee]">
                  {locale === 'ru' ? appData.categoryRu : appData.categoryEn}
                </span>
              </div>

              <div>
                <span className="text-[#757580] block">{locale === 'ru' ? 'Исполняемое произведение:' : 'Repertoire:'}</span>
                <span className="text-[#fcfcfc] font-medium">{appData.repertoire}</span>
              </div>

              <div>
                <span className="text-[#757580] block">{locale === 'ru' ? 'Преподаватель:' : 'Teacher:'}</span>
                <span className="text-[#dedfee]">
                  {locale === 'ru' ? appData.teacherNameRu : appData.teacherNameEn}
                </span>
              </div>

              <div>
                <span className="text-[#757580] block">{locale === 'ru' ? 'Учебное заведение:' : 'Institution:'}</span>
                <span className="text-[#dedfee]">
                  {locale === 'ru' ? appData.institutionRu : appData.institutionEn}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
