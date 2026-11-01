'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';

export default function CompetitionSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'espressivo-vocal-young-talents';
  const { locale } = useLanguage();

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16">
      {/* Contest Monograph Hero */}
      <div className="border-b border-[#000000] pb-8 mb-12">
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase font-bold tracking-widest text-[#757580] mb-3">
          <Link href="/competitions" className="hover:underline">
            COMPETITIONS
          </Link>
          <span>/</span>
          <span className="text-[#000000]">{slug.toUpperCase()}</span>
        </div>

        <h1 className="text-3xl sm:text-6xl font-serif text-[#000000] tracking-tight mb-4">
          espressivo VOCAL — Young Talents
        </h1>
        <p className="text-lg sm:text-xl font-serif text-[#121212] max-w-3xl leading-relaxed">
          {locale === 'ru'
            ? 'Международный академический конкурс вокального искусства для детей, юношества и молодежи (6–22 лет). Оценивается европейской коллегией консерваторских экспертов.'
            : 'International vocal arts adjudication for young vocalists and chamber ensembles. Adjudicated by European conservatory professors.'}
        </p>

        {/* Quick action bar */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/register">
            <Button variant="solid-ink" size="md">
              {locale === 'ru' ? 'Подать заявку участника' : 'Submit Entry'}
            </Button>
          </Link>
          <Link href={`/competitions/${slug}/nominations`}>
            <Button variant="outline-ink" size="md">
              {locale === 'ru' ? 'Спецификация номинаций' : 'Nominations & Categories'}
            </Button>
          </Link>
          <Link href={`/competitions/${slug}/rules`}>
            <Button variant="outline-ink" size="md">
              {locale === 'ru' ? 'Регламент и критерии (100 баллов)' : 'Rules & 100-pt Rubric'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Media */}
      <div className="aspect-[21/9] bg-[#000000] overflow-hidden mb-12 border border-[#000000]">
        <img
          src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2000&auto=format&fit=crop"
          alt="Performance Chiaroscuro"
          className="w-full h-full object-cover grayscale contrast-110"
        />
      </div>

      {/* Key Dates & Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-[#000000] mb-16">
        <div>
          <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#757580] block mb-2">
            {locale === 'ru' ? 'Календарь сезона' : 'Season Schedule'}
          </span>
          <div className="text-xl font-serif text-[#000000]">1 Февраля — 15 Июня 2026</div>
          <p className="text-xs font-serif text-[#121212] mt-1">
            {locale === 'ru' ? 'Приём видеозаписей онлайн до 23:59 CET' : 'Online entry submission until 23:59 CET'}
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#757580] block mb-2">
            {locale === 'ru' ? 'Взнос за участие' : 'Entry Fee'}
          </span>
          <div className="text-xl font-serif text-[#000000]">2 500 ₽ (Соло) / 4 000 ₽ (Ансамбль)</div>
          <p className="text-xs font-serif text-[#121212] mt-1">
            {locale === 'ru' ? 'Включает профессиональную рецензию и диплом' : 'Includes jury written review and official diploma'}
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#757580] block mb-2">
            {locale === 'ru' ? 'Педагогам' : 'Teacher Royalty'}
          </span>
          <div className="text-xl font-serif text-[#000000]">20% Партнерская выплата</div>
          <p className="text-xs font-serif text-[#121212] mt-1">
            {locale === 'ru' ? 'Официальное начисление за каждого направленного ученика' : 'Direct payout per referred pupil submission'}
          </p>
        </div>
      </div>

      {/* Detailed Timeline */}
      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-8 pb-3 border-b border-[#000000]">
          {locale === 'ru' ? 'Этапы проведения конкурса' : 'Competition Timeline & Stages'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-[#000000] p-6 bg-[#dedede]">
            <span className="font-mono text-xs text-[#757580] block mb-1">ЭТАП 01</span>
            <h3 className="text-lg font-serif text-[#000000] mb-2">Приём заявок</h3>
            <p className="text-xs font-serif text-[#121212]">
              До 15 июня: регистрация участников, проверка соответствия видеозаписи критериям непрерывного дубля.
            </p>
          </div>

          <div className="border border-[#000000] p-6 bg-[#dedede]">
            <span className="font-mono text-xs text-[#757580] block mb-1">ЭТАП 02</span>
            <h3 className="text-lg font-serif text-[#000000] mb-2">Слепое оценивание</h3>
            <p className="text-xs font-serif text-[#121212]">
              16–23 июня: судейская коллегия выставляет баллы по 4 критериям в терминале слепого прослушивания.
            </p>
          </div>

          <div className="border border-[#000000] p-6 bg-[#dedede]">
            <span className="font-mono text-xs text-[#757580] block mb-1">ЭТАП 03</span>
            <h3 className="text-lg font-serif text-[#000000] mb-2">Коллегия Гран-при</h3>
            <p className="text-xs font-serif text-[#121212]">
              24–27 июня: председатели жюри согласуют обладателей Гран-при и специальных премий фонда.
            </p>
          </div>

          <div className="border border-[#000000] p-6 bg-[#000000] text-[#ffffff]">
            <span className="font-mono text-xs text-white/70 block mb-1">ЭТАП 04</span>
            <h3 className="text-lg font-serif text-[#ffffff] mb-2">Итоги и дипломы</h3>
            <p className="text-xs font-serif text-white/80">
              30 июня: публикация официального реестра итогов, открытие доступа к скачиванию дипломов с QR-кодом.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="border border-[#000000] p-8 sm:p-12 text-center bg-[#dedede]">
        <h3 className="text-2xl sm:text-4xl font-serif text-[#000000] mb-4">
          {locale === 'ru' ? 'Готовы принять участие?' : 'Ready to Submit Your Performance?'}
        </h3>
        <p className="text-sm font-serif text-[#121212] max-w-xl mx-auto mb-6">
          {locale === 'ru'
            ? 'Регистрация занимает 5 минут. Потребуются данные участника, ссылка на видеозапись и контактные данные родителя или законного представителя.'
            : 'Registration takes approximately 5 minutes. Prepare entrant details, unlisted video link, and parent consent.'}
        </p>
        <Link href="/register">
          <Button variant="solid-ink" size="lg">
            {locale === 'ru' ? 'Подать заявку на конкурс' : 'Begin Online Entry'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
