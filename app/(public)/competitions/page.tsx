'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';

export default function CompetitionsPage() {
  const { locale } = useLanguage();
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'UPCOMING'>('ALL');

  const competitions = [
    {
      id: '1',
      slug: 'espressivo-vocal-young-talents',
      edition: 'SEASON I • 2026',
      titleRu: 'espressivo VOCAL — Young Talents',
      titleEn: 'espressivo VOCAL — Young Talents',
      status: 'OPEN',
      statusLabelRu: 'ПРИЕМ ЗАЯВОК ОТКРЫТ',
      statusLabelEn: 'ACCEPTING SUBMISSIONS',
      descriptionRu:
        'Международный конкурс вокального искусства для детей и молодежи (6–22 лет). Академический, эстрадный, джазовый, народный вокал и ансамбли.',
      descriptionEn:
        'International vocal arts adjudication for youth (ages 6–22). Classical, contemporary pop, jazz, ethno-vocal disciplines and chamber vocal ensembles.',
      deadlineRu: 'Дедлайн: 15 июня 2026',
      deadlineEn: 'Deadline: June 15, 2026',
      fee: '2 500 ₽ / €45',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: '2',
      slug: 'espressivo-piano-masterworks',
      edition: 'SEASON II • AUTUMN 2026',
      titleRu: 'espressivo PIANO — Masterworks',
      titleEn: 'espressivo PIANO — Masterworks',
      status: 'UPCOMING',
      statusLabelRu: 'СКОРО ОТКРЫТИЕ',
      statusLabelEn: 'UPCOMING SEASON',
      descriptionRu:
        'Конкурс фортепианного исполнительства. Полифонические циклы, сонатные формы, романтические миниатюры и виртуозные этюды.',
      descriptionEn:
        'Piano masterworks competition. Polyphonic cycles, sonata forms, romantic miniatures, and virtuoso concert etudes.',
      deadlineRu: 'Старт приема: 1 сентября 2026',
      deadlineEn: 'Opens: September 1, 2026',
      fee: '3 000 ₽ / €55',
      image: 'https://images.unsplash.com/photo-1520523839898-5071282543e2?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: '3',
      slug: 'espressivo-strings-virtuoso',
      edition: 'SEASON III • WINTER 2026',
      titleRu: 'espressivo STRINGS — Virtuoso',
      titleEn: 'espressivo STRINGS — Virtuoso',
      status: 'UPCOMING',
      statusLabelRu: 'АНОНС СЕЗОНА',
      statusLabelEn: 'PROSPECTUS ANNOUNCED',
      descriptionRu:
        'Струнно-смычковое искусство: скрипка, виолончель, альт, контрабас. Академическая школа и строгое международное жюри.',
      descriptionEn:
        'String instruments: violin, cello, viola, double bass. World-class conservatory jury and certified audio-visual screening.',
      deadlineRu: 'Старт приема: 15 ноября 2026',
      deadlineEn: 'Opens: November 15, 2026',
      fee: '3 000 ₽ / €55',
      image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  const filtered = competitions.filter((c) => {
    if (filter === 'OPEN') return c.status === 'OPEN';
    if (filter === 'UPCOMING') return c.status === 'UPCOMING';
    return true;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16">
      {/* Editorial Header */}
      <div className="border-b border-[#000000] pb-6 mb-12">
        <span className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212] mb-3 block">
          CATALOGUE OF EDITIONS
        </span>
        <h1 className="text-4xl sm:text-6xl font-serif text-[#000000] tracking-tight">
          {locale === 'ru' ? 'Конкурсы и сезоны' : 'Competitions & Seasons'}
        </h1>
        <p className="text-base sm:text-lg font-serif text-[#121212] mt-4 max-w-2xl">
          {locale === 'ru'
            ? 'Реестр официальных международных сезонов платформы espressivo ART. Выберите интересующую дисциплину и перейдите к монографии конкурса.'
            : 'Official directory of international competition seasons under the auspices of espressivo ART foundation.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-[#000000]/20 pb-4 mb-12 font-sans text-[10px] uppercase tracking-wider font-bold">
        <button
          onClick={() => setFilter('ALL')}
          className={`cursor-pointer transition-colors pb-1 ${
            filter === 'ALL' ? 'border-b-2 border-[#000000] text-[#000000]' : 'text-[#757580] hover:text-[#000000]'
          }`}
        >
          {locale === 'ru' ? 'Все сезоны' : 'All Editions'}
        </button>
        <button
          onClick={() => setFilter('OPEN')}
          className={`cursor-pointer transition-colors pb-1 ${
            filter === 'OPEN' ? 'border-b-2 border-[#000000] text-[#000000]' : 'text-[#757580] hover:text-[#000000]'
          }`}
        >
          {locale === 'ru' ? 'Открыт приём заявок' : 'Open for Submissions'}
        </button>
        <button
          onClick={() => setFilter('UPCOMING')}
          className={`cursor-pointer transition-colors pb-1 ${
            filter === 'UPCOMING' ? 'border-b-2 border-[#000000] text-[#000000]' : 'text-[#757580] hover:text-[#000000]'
          }`}
        >
          {locale === 'ru' ? 'Будущие сезоны' : 'Upcoming Seasons'}
        </button>
      </div>

      {/* Competitions Monograph List */}
      <div className="space-y-16">
        {filtered.map((c) => (
          <article
            key={c.id}
            className="border border-[#000000] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:bg-[#dedede] transition-colors"
          >
            <div className="lg:col-span-5 aspect-[16/10] bg-[#000000] overflow-hidden">
              <img
                src={c.image}
                alt={c.titleRu}
                className="w-full h-full object-cover grayscale contrast-110"
              />
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#757580]">
                    {c.edition}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-sans font-bold tracking-widest px-2 py-0.5 border ${
                      c.status === 'OPEN'
                        ? 'border-[#000000] bg-[#000000] text-[#ffffff]'
                        : 'border-[#757580] text-[#757580]'
                    }`}
                  >
                    {locale === 'ru' ? c.statusLabelRu : c.statusLabelEn}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-serif text-[#000000] mb-4">
                  {locale === 'ru' ? c.titleRu : c.titleEn}
                </h2>

                <p className="text-sm sm:text-base font-serif text-[#121212] leading-relaxed mb-6">
                  {locale === 'ru' ? c.descriptionRu : c.descriptionEn}
                </p>

                <div className="flex flex-wrap gap-6 text-xs font-sans text-[#121212] border-t border-[#000000]/15 pt-4 mb-6">
                  <div>
                    <span className="text-[#757580] block text-[10px] uppercase font-bold">
                      {locale === 'ru' ? 'Сроки' : 'Timeline'}
                    </span>
                    <span className="font-serif text-sm">
                      {locale === 'ru' ? c.deadlineRu : c.deadlineEn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#757580] block text-[10px] uppercase font-bold">
                      {locale === 'ru' ? 'Взнос' : 'Entry Fee'}
                    </span>
                    <span className="font-serif text-sm">{c.fee}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href={`/competitions/${c.slug}`}>
                  <Button variant="solid-ink" size="md">
                    {locale === 'ru' ? 'Монография и регламент' : 'Prospectus & Rules'}
                  </Button>
                </Link>
                {c.status === 'OPEN' && (
                  <Link href="/register">
                    <Button variant="outline-ink" size="md">
                      {locale === 'ru' ? 'Подать заявку' : 'Apply Now'}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
