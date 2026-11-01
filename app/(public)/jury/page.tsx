'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';

export default function JuryPage() {
  const { locale } = useLanguage();

  const juryMembers = [
    {
      id: '1',
      nameRu: 'Проф. Вальтер Кауфманн',
      nameEn: 'Prof. Walter Kaufmann',
      titleRu: 'Председатель судейской коллегии',
      titleEn: 'President of the Adjudication Board',
      institutionRu: 'Венский университет музыки и исполнительского искусства, Венская государственная опера',
      institutionEn: 'Vienna University of Music and Performing Arts, Vienna State Opera',
      countryRu: 'Австрия / Вена',
      countryEn: 'Austria / Vienna',
      bioRu:
        'Выдающийся австрийский баритон и педагог вокального искусства. Воспитал более 30 солистов ведущих оперных театров Европы. Автор методики бережного развития юношеских голосов.',
      bioEn:
        'Distinguished Austrian baritone and vocal pedagogue. Trained over 30 leading soloists across European opera houses. Renowned specialist in youth vocal development.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: '2',
      nameRu: 'Елена Беллелли',
      nameEn: 'Elena Bellelli',
      titleRu: 'Прима-сопрано, член экспертного совета',
      titleEn: 'Prima Soprano, Board Adjudicator',
      institutionRu: 'Миланская консерватория имени Джузеппе Верди',
      institutionEn: 'Milan Conservatory of Giuseppe Verdi',
      countryRu: 'Италия / Милан',
      countryEn: 'Italy / Milan',
      bioRu:
        'Лауреат международных конкурсов в Вероне и Парме. Выступала на сценах Ла Скала, Ковент-Гарден и Метрополитен-опера. Эксперт по репертуару бельканто.',
      bioEn:
        'Laureate of international competitions in Verona and Parma. Regular guest soloist at La Scala, Royal Opera House, and Met. Master of the Italian bel canto repertoire.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: '3',
      nameRu: 'Маркус Торнтон',
      nameEn: 'Marcus Thornton',
      titleRu: 'Дирижер, педагог по камерному пению',
      titleEn: 'Conductor & Chamber Vocal Professor',
      institutionRu: 'Королевская академия музыки (Лондон)',
      institutionEn: 'Royal Academy of Music (London)',
      countryRu: 'Великобритания / Лондон',
      countryEn: 'United Kingdom / London',
      bioRu:
        'Признанный специалист по хоровому дирижированию и камерным вокальным ансамблям. Сотрудничает с BBC Singers и Лондонским симфоническим оркестром.',
      bioEn:
        'Internationally acclaimed specialist in choral conducting and chamber vocal polyphony. Frequent collaborator with BBC Singers and London Symphony Orchestra.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: '4',
      nameRu: 'Ирина Серебрякова',
      nameEn: 'Irina Serebryakova',
      titleRu: 'Заслуженная артистка РФ, доцент',
      titleEn: 'Honored Artist, Associate Professor',
      institutionRu: 'Санкт-Петербургская государственная консерватория им. Н. А. Римского-Корсакова',
      institutionEn: 'Saint Petersburg Rimsky-Korsakov State Conservatory',
      countryRu: 'Россия / Санкт-Петербург',
      countryEn: 'Russia / Saint Petersburg',
      bioRu:
        'Более 25 лет педагогической практики в академическом и эстрадно-джазовом вокале. Председатель жюри многочисленных всероссийских и международных конкурсов юных талантов.',
      bioEn:
        'Over 25 years of master pedagogy in academic, crossover, and jazz vocal training. Regular chair of youth vocal adjudication panels across Eastern Europe.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: '5',
      nameRu: 'Д-р Ханс-Петер Краузе',
      nameEn: 'Dr. Hans-Peter Krause',
      titleRu: 'Профессор вокальной фонетики и стилистики',
      titleEn: 'Professor of Vocal Phonetics & Style',
      institutionRu: 'Берлинский университет искусств (UdK Berlin)',
      institutionEn: 'Berlin University of the Arts (UdK)',
      countryRu: 'Германия / Берлин',
      countryEn: 'Germany / Berlin',
      bioRu:
        'Ведущий европейский исследователь вокальной акустики и физиологии певческого голоса. Консультант немецких оперных театров по кастингу молодых солистов.',
      bioEn:
        'Leading European researcher in vocal acoustic physiology and diction. Senior advisor on young talent audition panels across German state theatres.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: '6',
      nameRu: 'Клер Делакруа',
      nameEn: 'Claire Delacroix',
      titleRu: 'Педагог по современному и эстрадному вокалу',
      titleEn: 'Contemporary & Commercial Vocal Coach',
      institutionRu: 'Высшая национальная консерватория музыки и танца (Париж)',
      institutionEn: 'Conservatoire National Supérieur de Musique et de Danse de Paris',
      countryRu: 'Франция / Париж',
      countryEn: 'France / Paris',
      bioRu:
        'Наставник финалистов европейских вокальных телепроектов. Специализируется на современной вокальной технике (тванговые стили, белтинг, микст).',
      bioEn:
        'Vocal coach for finalists in major European broadcast vocal showcases. Specialises in healthy contemporary belt, twang, and contemporary vocal crossover.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16">
      {/* Editorial Header */}
      <div className="border-b border-[#000000] pb-6 mb-12">
        <span className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212] mb-3 block">
          INTERNATIONAL ADJUDICATION BOARD
        </span>
        <h1 className="text-3xl sm:text-6xl font-serif text-[#000000] tracking-tight">
          {locale === 'ru' ? 'Судейская коллегия' : 'International Jury Board'}
        </h1>
        <p className="text-base sm:text-lg font-serif text-[#121212] mt-4 max-w-3xl leading-relaxed">
          {locale === 'ru'
            ? 'Оценивание конкурсов espressivo ART осуществляется признанными мастерами оперной сцены, профессорами ведущих европейских консерваторий и опытными педагогами-практиками. Полная независимость оценок гарантирована протоколом слепого прослушивания.'
            : 'Adjudication at espressivo ART is conducted by renowned concert artists, professors from leading European conservatories, and experienced educators.'}
        </p>
      </div>

      {/* Protocol Guarantee Banner */}
      <div className="border border-[#000000] p-6 sm:p-8 bg-[#dedede] mb-16 flex flex-col sm:flex-row justify-between items-baseline gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#757580] block mb-1">
            PROTOCOL OF INTEGRITY
          </span>
          <h3 className="text-xl font-serif text-[#000000]">
            Гарантия непредвзятости: слепое прослушивание
          </h3>
          <p className="text-xs sm:text-sm font-serif text-[#121212] mt-1 max-w-2xl">
            Члены жюри не видят личных данных участников до момента выставления окончательных оценок. Видеоряд скрывается при первом раунде прослушивания.
          </p>
        </div>
        <Link href="/competitions/espressivo-vocal-young-talents/rules">
          <Button variant="outline-ink" size="sm" className="shrink-0">
            Изучить протокол
          </Button>
        </Link>
      </div>

      {/* Jury Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
        {juryMembers.map((member) => (
          <article
            key={member.id}
            className="border border-[#000000] p-6 flex flex-col justify-between hover:bg-[#dedede] transition-colors"
          >
            <div>
              <div className="aspect-square bg-[#000000] overflow-hidden mb-6 border border-[#000000]">
                <img
                  src={member.image}
                  alt={member.nameRu}
                  className="w-full h-full object-cover grayscale contrast-110"
                />
              </div>

              <div className="flex justify-between items-baseline gap-2 mb-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#757580]">
                  {locale === 'ru' ? member.countryRu : member.countryEn}
                </span>
              </div>

              <h2 className="text-2xl font-serif text-[#000000] mb-1">
                {locale === 'ru' ? member.nameRu : member.nameEn}
              </h2>

              <p className="text-xs font-sans uppercase tracking-wider text-[#000000] font-semibold mb-3">
                {locale === 'ru' ? member.titleRu : member.titleEn}
              </p>

              <p className="text-xs font-serif text-[#757580] italic mb-4">
                {locale === 'ru' ? member.institutionRu : member.institutionEn}
              </p>

              <p className="text-sm font-serif text-[#121212] leading-relaxed pt-3 border-t border-[#000000]/15">
                {locale === 'ru' ? member.bioRu : member.bioEn}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="border border-[#000000] p-10 text-center bg-[#000000] text-white">
        <h3 className="text-2xl sm:text-3xl font-serif mb-4">
          Представьте своё выступление перед экспертами
        </h3>
        <p className="text-sm font-serif text-[#dedfee] max-w-lg mx-auto mb-6">
          Каждый конкурсант получает персональную письменную рецензию от члена жюри с рекомендациями по вокальному развитию.
        </p>
        <Link href="/register">
          <Button variant="solid-ink" size="lg" className="!bg-[#ffffff] !text-[#000000] hover:!bg-[#dedede]">
            Подать заявку на конкурс
          </Button>
        </Link>
      </div>
    </div>
  );
}
