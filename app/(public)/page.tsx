'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export default function HomePage() {
  const { locale } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const nominations = [
    {
      code: 'VOC-ACAD',
      titleRu: 'Академический вокал (Соло)',
      titleEn: 'Academic / Classical Solo Vocal',
      descRu: 'Оперные арии, старинные канцоны, романсы русских и зарубежных классиков.',
      descEn: 'Opera arias, antique canzonas, romances of classical composers.',
    },
    {
      code: 'VOC-POP',
      titleRu: 'Эстрадный вокал',
      titleEn: 'Pop & Contemporary Vocal',
      descRu: 'Мировые хиты, авторские произведения, современные стили звукоизвлечения.',
      descEn: 'World hits, original works, contemporary stylistic vocal performance.',
    },
    {
      code: 'VOC-JAZZ',
      titleRu: 'Джазовый вокал',
      titleEn: 'Jazz Vocal & Improvisation',
      descRu: 'Джазовые стандарты, скэт-импровизация, блюзовые и соул композиции.',
      descEn: 'Jazz standards, scat improvisation, blues and soul ballads.',
    },
    {
      code: 'VOC-FOLK',
      titleRu: 'Народное и этно-пение',
      titleEn: 'Folk & Ethno Vocal',
      descRu: 'Аутентичный фольклор, стилизованная народная песня, этнические традиции.',
      descEn: 'Authentic folklore, stylized folk song, regional vocal heritage.',
    },
    {
      code: 'VOC-ENS',
      titleRu: 'Вокальные ансамбли и дуэты',
      titleEn: 'Vocal Ensembles & Duos',
      descRu: 'Дуэты, трио, малые вокальные ансамбли (до 12 участников).',
      descEn: 'Duets, trios, chamber vocal ensembles up to 12 performers.',
    },
  ];

  const ageCategories = [
    { code: 'CAT-0', labelRu: 'Дебют', labelEn: 'Debut', age: '6–8 лет' },
    { code: 'CAT-1', labelRu: 'Младшая', labelEn: 'Junior', age: '9–11 лет' },
    { code: 'CAT-2', labelRu: 'Средняя', labelEn: 'Intermediate', age: '12–14 лет' },
    { code: 'CAT-3', labelRu: 'Старшая', labelEn: 'Advanced', age: '15–17 лет' },
    { code: 'CAT-4', labelRu: 'Молодежная', labelEn: 'Youth Master', age: '18–22 года' },
  ];

  const juryBoard = [
    {
      nameRu: 'Проф. Вальтер Кауфманн',
      nameEn: 'Prof. Walter Kaufmann',
      roleRu: 'Председатель жюри, Венская государственная опера',
      roleEn: 'Jury President, Vienna State Opera',
      location: 'Вена, Австрия',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    },
    {
      nameRu: 'Елена Беллелли',
      nameEn: 'Elena Bellelli',
      roleRu: 'Прима-сопрано, Консерватория им. Дж. Верди',
      roleEn: 'Prima Soprano, Milan Conservatory',
      location: 'Милан, Италия',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    },
    {
      nameRu: 'Маркус Торнтон',
      nameEn: 'Marcus Thornton',
      roleRu: 'Дирижер, Королевская академия музыки',
      roleEn: 'Conductor, Royal Academy of Music',
      location: 'Лондон, Великобритания',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    },
    {
      nameRu: 'Ирина Серебрякова',
      nameEn: 'Irina Serebryakova',
      roleRu: 'Заслуженная артистка, педагог высшей категории',
      roleEn: 'Honored Artist, Master Vocal Coach',
      location: 'Санкт-Петербург, Россия',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    },
  ];

  const faqs = [
    {
      qRu: 'Какие требования предъявляются к видеозаписи выступления?',
      qEn: 'What are the technical requirements for performance video recordings?',
      aRu: 'Запись должна быть сделана непрерывным дублем без монтажных склеек, остановки камеры и использования тюнинга голоса (Pitch Correction / Auto-Tune). Исполнитель должен быть виден в полный рост или по пояс. Минимальное разрешение — Full HD 1080p.',
      aEn: 'The video must be recorded in a single continuous take without cuts, editing, or pitch correction/autotune. The performer must be visible full-body or torso. Minimum video resolution is Full HD 1080p.',
    },
    {
      qRu: 'Как работает реферальная программа для преподавателей (20%)?',
      qEn: 'How does the teacher referral program (20%) work?',
      aRu: 'Каждый педагог получает персональный реферальный код в кабинете преподавателя. При указании кода учеником или при переходе по ссылке, 20% от регистрационного взноса мгновенно зачисляются на баланс педагога с возможностью официального вывода.',
      aEn: 'Every teacher receives a personal referral code in their dashboard. When students register using the link or code, 20% of the contest entry fee is immediately credited to the teacher balance with verified bank payout options.',
    },
    {
      qRu: 'Каковы критерии оценивания жюри?',
      qEn: 'What is the jury evaluation scoring criteria?',
      aRu: 'Оценивание проводится по 100-балльной системе (4 критерия по 25 баллов): Вокальная техника и чистота интонации, Музыкальность и фразировка, Артистизм и сценическое воплощение, Сложность и соответствие репертуара.',
      aEn: 'Adjudication follows a 100-point rubric (4 criteria x 25 points): Vocal Technique & Pitch Accuracy, Musicality & Phrasing, Artistry & Interpretation, Complexity & Style Compliance.',
    },
    {
      qRu: 'В каком виде выдаются дипломы и сертификаты?',
      qEn: 'How are diplomas and certificates issued?',
      aRu: 'Каждый участник получает официальный электронный диплом международного образца с уникальным верификационным номером и QR-кодом для проверки подлинности, доступный для скачивания в PDF высокого полиграфического качества.',
      aEn: 'Every entrant receives an official international diploma featuring a unique verification code and QR code for authenticity verification, downloadable as a high-resolution print-ready PDF.',
    },
  ];

  return (
    <div className="w-full">
      {/* 1. Full-Bleed Hero Spread */}
      <section className="w-full animate-fade-in">
        <div className="relative w-full aspect-[21/9] min-h-[380px] sm:min-h-[520px] bg-[#000000] overflow-hidden editorial-img-container">
          <img
            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2000&auto=format&fit=crop"
            alt="Young Soprano Soloist"
            className="w-full h-full object-cover object-center grayscale contrast-110"
          />
        </div>

        {/* Hero Colophon Row */}
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-3 flex flex-col sm:flex-row justify-between items-baseline gap-2 border-b border-[#000000]">
          <span className="text-sm sm:text-base font-serif text-[#000000]">
            FEATURED SOLOIST — ELENA ROSTOVA, SOPRANO (14 Y.O.)
          </span>
          <span className="text-[10px] uppercase font-sans font-medium tracking-[0.033em] text-[#121212]">
            CURRENT EDITION: ESPRESSIVO VOCAL • SEASON 2026
          </span>
        </div>
      </section>

      {/* 2. Curated Mission Statement */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-20 sm:py-28 text-center border-b border-[#000000]/15">
        <div className="max-w-3xl mx-auto">
          <span className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212] mb-6 block">
            {locale === 'ru' ? 'МАНИФЕСТ ПЛАТФОРМЫ' : 'PLATFORM MANIFESTO'}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-serif font-normal leading-[1.12] text-[#000000] tracking-[-0.018em]">
            {locale === 'ru'
              ? 'Международное святилище, где дисциплина юного таланта встречается с бескомпромиссным судейством. Оценивается в тишине. Прославляется навсегда.'
              : 'An international sanctuary where young musical discipline meets world-class jury rigor. Judged in silence. Celebrated with permanence.'}
          </h1>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/register">
              <Button variant="solid-ink" size="lg">
                {locale === 'ru' ? 'Подать заявку на сезон 2026' : 'Enter 2026 Season'}
              </Button>
            </Link>
            <Link href="/competitions/espressivo-vocal-young-talents/rules">
              <Button variant="outline-ink" size="lg">
                {locale === 'ru' ? 'Изучить регламент' : 'View Prospectus'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Active Contest Feature Spread */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-20 border-b border-[#000000]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 aspect-[3/4] bg-[#dedede] border border-[#000000] relative overflow-hidden editorial-img-container">
            <img
              src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop"
              alt="espressivo VOCAL Monograph"
              className="w-full h-full object-cover grayscale contrast-125"
            />
            <div className="absolute top-4 left-4 bg-[#000000] text-[#ffffff] px-3 py-1 text-[9px] uppercase font-sans font-bold tracking-widest">
              OFFICIAL MONOGRAPH
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212] mb-3">
                {locale === 'ru' ? 'ГЛАВНОЕ СОБЫТИЕ СЕЗОНА' : 'SEASON SPOTLIGHT'}
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#000000] leading-tight mb-6">
                espressivo VOCAL — Young Talents
              </h2>
              <p className="text-lg font-serif text-[#121212] leading-relaxed mb-8">
                {locale === 'ru'
                  ? 'Международный вокальный конкурс для солистов и ансамблей от 6 до 22 лет. Дистанционный формат высокой точности с коллегиальным оцениванием профессорами консерваторий Вены, Милана и Лондона.'
                  : 'International vocal adjudication for soloists and ensembles aged 6 to 22. High-precision remote format evaluated by conservatoire professors from Vienna, Milan, and London.'}
              </p>

              {/* Contest Key Metric Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-[#000000]">
                <div>
                  <div className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#757580]">
                    {locale === 'ru' ? 'Призовой фонд' : 'Prize Fund'}
                  </div>
                  <div className="text-2xl font-serif text-[#000000] mt-1">€15,000</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#757580]">
                    {locale === 'ru' ? 'Взнос за соло' : 'Solo Entry'}
                  </div>
                  <div className="text-2xl font-serif text-[#000000] mt-1">2 500 ₽</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#757580]">
                    {locale === 'ru' ? 'Комиссия педагога' : 'Teacher Royalty'}
                  </div>
                  <div className="text-2xl font-serif text-[#000000] mt-1">20%</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#757580]">
                    {locale === 'ru' ? 'Дедлайн заявок' : 'Closing Date'}
                  </div>
                  <div className="text-xl font-serif text-[#000000] mt-1">15 Июня</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register">
                <Button variant="solid-ink" size="md">
                  {locale === 'ru' ? 'Заполнить анкету участника' : 'Submit Application'}
                </Button>
              </Link>
              <Link href="/competitions/espressivo-vocal-young-talents">
                <Button variant="outline-ink" size="md">
                  {locale === 'ru' ? 'Подробная монография конкурса' : 'Read Full Monograph'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Nominations & Age Divisions Matrix */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-20 border-b border-[#000000]/15">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-12 border-b border-[#000000] pb-4">
          <h2 className="text-2xl sm:text-4xl font-serif text-[#000000]">
            {locale === 'ru' ? 'Номинации и направления' : 'Nominations & Disciplines'}
          </h2>
          <span className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212]">
            5 НОМИНАЦИЙ • 5 ВОЗРАСТНЫХ ГРУПП
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nominations.map((nom) => (
            <div
              key={nom.code}
              className="border border-[#000000] p-6 flex flex-col justify-between hover:bg-[#dedede] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md cursor-pointer"
            >
              <div>
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#757580] mb-2 block">
                  {nom.code}
                </span>
                <h3 className="text-xl font-serif text-[#000000] mb-3">
                  {locale === 'ru' ? nom.titleRu : nom.titleEn}
                </h3>
                <p className="text-sm font-serif text-[#121212] leading-relaxed">
                  {locale === 'ru' ? nom.descRu : nom.descEn}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#000000]/15 flex items-center justify-between">
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#000000]">
                  {locale === 'ru' ? 'Регламент: до 4:30 мин' : 'Limit: 4:30 min'}
                </span>
                <Link
                  href="/competitions/espressivo-vocal-young-talents/nominations"
                  className="text-xs hover:underline flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {/* Age Group Card */}
          <div className="border border-[#000000] bg-[#000000] text-[#ffffff] p-6 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-[#a3a3b3] mb-2 block">
                AGE BRACKETS
              </span>
              <h3 className="text-xl font-serif text-[#ffffff] mb-4">
                {locale === 'ru' ? 'Возрастные группы' : 'Age Categories'}
              </h3>
              <div className="space-y-2 text-xs font-sans">
                {ageCategories.map((cat) => (
                  <div key={cat.code} className="flex justify-between border-b border-white/20 pb-1">
                    <span className="text-white/80">
                      {locale === 'ru' ? cat.labelRu : cat.labelEn}
                    </span>
                    <span className="font-mono text-white">{cat.age}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Link href="/register">
                <Button variant="outline-ink" fullWidth className="!border-white !text-white hover:!bg-white hover:!text-black">
                  {locale === 'ru' ? 'Выбрать и подать заявку' : 'Apply For Category'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Four Pillars of Adjudication */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-20 border-b border-[#000000]">
        <div className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212] mb-3">
          STANDARDS OF EXCELLENCE
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif text-[#000000] mb-12">
          {locale === 'ru' ? 'Четыре столпа объективного судейства' : 'Four Pillars of Adjudication'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="border-t-2 border-[#000000] pt-4">
            <div className="text-sm font-mono text-[#757580] mb-2">01 // BLIND MODE</div>
            <h4 className="text-lg font-serif text-[#000000] mb-2">Слепое прослушивание</h4>
            <p className="text-xs font-serif text-[#121212] leading-relaxed">
              Члены жюри оценивают записи в режиме скрытого видеоряда, исключая предвзятость по возрасту, костюму или внешности.
            </p>
          </div>

          <div className="border-t-2 border-[#000000] pt-4">
            <div className="text-sm font-mono text-[#757580] mb-2">02 // 100 PTS RUBRIC</div>
            <h4 className="text-lg font-serif text-[#000000] mb-2">100-балльная шкала</h4>
            <p className="text-xs font-serif text-[#121212] leading-relaxed">
              4 критерия по 25 баллов: техника вокала, чистота интонации, сценический артистизм и сложность произведения.
            </p>
          </div>

          <div className="border-t-2 border-[#000000] pt-4">
            <div className="text-sm font-mono text-[#757580] mb-2">03 // PERSONAL REVIEW</div>
            <h4 className="text-lg font-serif text-[#000000] mb-2">Текстовые рецензии</h4>
            <p className="text-xs font-serif text-[#121212] leading-relaxed">
              Каждый участник получает развёрнутый профессиональный отзыв от европейских педагогов для дальнейшего роста.
            </p>
          </div>

          <div className="border-t-2 border-[#000000] pt-4">
            <div className="text-sm font-mono text-[#757580] mb-2">04 // VERIFIED DIPLOMAS</div>
            <h4 className="text-lg font-serif text-[#000000] mb-2">Дипломы с QR-защитой</h4>
            <p className="text-xs font-serif text-[#121212] leading-relaxed">
              Официальные дипломы международного образца с нестираемым реестровым номером в мировом каталоге.
            </p>
          </div>
        </div>
      </section>

      {/* 6. International Jury Board */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-20 border-b border-[#000000]/15">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-12 border-b border-[#000000] pb-4">
          <h2 className="text-2xl sm:text-4xl font-serif text-[#000000]">
            {locale === 'ru' ? 'Судейская коллегия' : 'International Adjudicators'}
          </h2>
          <Link
            href="/jury"
            className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#000000] hover:underline"
          >
            {locale === 'ru' ? 'ПОЛНЫЙ СОСТАВ ЖЮРИ →' : 'VIEW FULL BOARD →'}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {juryBoard.map((member, i) => (
            <div key={i} className="flex flex-col">
              <div className="aspect-square bg-[#dedede] border border-[#000000] overflow-hidden mb-4 editorial-img-container">
                <img
                  src={member.image}
                  alt={member.nameRu}
                  className="w-full h-full object-cover grayscale contrast-110"
                />
              </div>
              <h3 className="text-lg font-serif text-[#000000]">
                {locale === 'ru' ? member.nameRu : member.nameEn}
              </h3>
              <p className="text-xs font-sans uppercase tracking-wider text-[#757580] mt-1">
                {member.location}
              </p>
              <p className="text-xs font-serif text-[#121212] mt-2 leading-snug">
                {locale === 'ru' ? member.roleRu : member.roleEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Accordion */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-20 border-b border-[#000000]">
        <div className="max-w-3xl mx-auto">
          <div className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212] mb-3 text-center">
            QUESTIONS & ANSWERS
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#000000] mb-12 text-center">
            {locale === 'ru' ? 'Часто задаваемые вопросы' : 'Frequently Asked Questions'}
          </h2>

          <div className="border-t border-[#000000]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="border-b border-[#000000]">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full py-5 text-left flex justify-between items-center gap-4 hover:opacity-75 cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-serif text-[#000000]">
                      {locale === 'ru' ? faq.qRu : faq.qEn}
                    </span>
                    <span className="shrink-0 text-[#000000]">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pb-6 text-sm font-serif text-[#121212] leading-relaxed animate-slide-down">
                      {locale === 'ru' ? faq.aRu : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Bottom Full-Bleed Grand CTA Spread */}
      <section className="w-full bg-[#000000] text-[#ffffff] py-20 sm:py-28 px-6 sm:px-10 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#a3a3b3] mb-4 block">
            LIMITED SUBMISSION WINDOW • SEASON I
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal mb-6 text-[#ffffff]">
            {locale === 'ru'
              ? 'Приём конкурсных заявок закрывается в полночь 15 июня.'
              : 'Applications close strictly at midnight CET on June 15.'}
          </h2>
          <p className="text-sm sm:text-base font-serif text-[#dedfee] mb-8 leading-relaxed">
            {locale === 'ru'
              ? 'Подготовьте видеозапись без склеек и автотюна, заполните форму участника и представьте своё вокальное мастерство перед европейской коллегией.'
              : 'Prepare your continuous unedited video recording, complete the entrant registration, and perform before the international conservatory board.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/register">
              <Button variant="solid-ink" size="lg" className="!bg-[#ffffff] !text-[#000000] !border-[#ffffff] hover:!bg-[#e7e7e7]">
                {locale === 'ru' ? 'Подать заявку сейчас' : 'Begin Application'}
              </Button>
            </Link>
            <Link href="/competitions">
              <Button variant="outline-ink" size="lg" className="!text-[#ffffff] !border-[#ffffff] hover:!bg-[#ffffff] hover:!text-[#000000]">
                {locale === 'ru' ? 'Каталог сезонов' : 'Browse All Seasons'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
