'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  const { locale } = useLanguage();

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16">
      {/* Title */}
      <div className="border-b border-[#000000] pb-6 mb-12">
        <span className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212] mb-3 block">
          INSTITUTIONAL PROFILE
        </span>
        <h1 className="text-3xl sm:text-6xl font-serif text-[#000000] tracking-tight">
          {locale === 'ru' ? 'О платформе espressivo ART' : 'About espressivo ART Platform'}
        </h1>
        <p className="text-base sm:text-lg font-serif text-[#121212] mt-4 max-w-3xl leading-relaxed">
          {locale === 'ru'
            ? 'Международная конкурсная платформа нового поколения, созданная для выявления, профессиональной экспертизы и долгосрочной поддержки молодых исполнителей в сфере вокала и инструментального искусства.'
            : 'Next-generation international adjudication sanctuary dedicated to the discovery, uncompromising evaluation, and promotion of young performing artists.'}
        </p>
      </div>

      {/* Main Philosophy Editorial Spread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        <div className="lg:col-span-6 aspect-[4/3] bg-[#000000] overflow-hidden border border-[#000000]">
          <img
            src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop"
            alt="Art Gallery Spread"
            className="w-full h-full object-cover grayscale contrast-110"
          />
        </div>

        <div className="lg:col-span-6 space-y-6 font-serif text-[#121212] text-base leading-relaxed">
          <h2 className="text-2xl sm:text-4xl font-serif text-[#000000]">
            {locale === 'ru'
              ? 'Почему мы отказались от шаблонных фестивалей'
              : 'Why We Departed From Templated Competitions'}
          </h2>
          <p>
            {locale === 'ru'
              ? 'Большинство современных дистанционных конкурсов превратились в конвейер по продаже бессодержательных дипломов без реального просмотра видео и без содержательной обратной связи.'
              : 'Most contemporary online festivals have devolved into commercial mills dispensing meaningless certificates without genuine evaluation or substantive feedback.'}
          </p>
          <p>
            {locale === 'ru' ? (
              <>
                Платформа <strong>espressivo ART</strong> создана как ответ на эту деградацию. Мы возвращаем в дистанционные состязания строгую академическую культуру: коллегиальное оценивание по 100-балльной системе, слепое прослушивание для исключения предвзятости и обязательную развернутую рецензию от авторитетного европейского педагога.
              </>
            ) : (
              <>
                The <strong>espressivo ART</strong> platform was founded as a counterweight to this dilution. We restore rigorous academic integrity to distance adjudications: a collegial 100-point rubric, blind audio audition to preclude prejudice, and comprehensive written critiques by European conservatory professors.
              </>
            )}
          </p>
          <p>
            {locale === 'ru'
              ? 'Дипломы espressivo ART признаются в качестве официального портфолио для поступления в музыкальные училища, колледжи и консерватории.'
              : 'espressivo ART diplomas serve as verified credential portfolios for admissions to renowned music colleges and conservatories.'}
          </p>
        </div>
      </div>

      {/* Key Differences Grid */}
      <div className="border-t border-[#000000] pt-12 mb-16">
        <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#757580] block mb-4">
          CORE PRINCIPLES
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-8">
          {locale === 'ru' ? 'Фундаментальные стандарты качества' : 'Core Quality Benchmarks'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-[#000000] p-6 bg-[#dedede]">
            <span className="font-mono text-xs text-[#757580] block mb-2">01 // INTEGRITY</span>
            <h3 className="text-xl font-serif text-[#000000] mb-3">
              {locale === 'ru' ? '100% реальное прослушивание' : '100% Authentic Adjudication'}
            </h3>
            <p className="text-sm font-serif text-[#121212] leading-relaxed">
              {locale === 'ru'
                ? 'Каждое конкурсное видео воспроизводится экспертом полностью в специализированном терминале с фиксацией таймкодов и замечаний.'
                : 'Every entrant video is audited entirely inside our encrypted terminal, recording precise pedagogical timestamps and annotations.'}
            </p>
          </div>

          <div className="border border-[#000000] p-6 bg-[#dedede]">
            <span className="font-mono text-xs text-[#757580] block mb-2">02 // TRANSPARENCY</span>
            <h3 className="text-xl font-serif text-[#000000] mb-3">
              {locale === 'ru' ? 'Публичный реестр дипломов' : 'Public Diploma Registry'}
            </h3>
            <p className="text-sm font-serif text-[#121212] leading-relaxed">
              {locale === 'ru'
                ? 'Каждый диплом снабжен криптографическим QR-кодом и доступен для мгновенной проверки приемными комиссиями и образовательными центрами.'
                : 'Each certificate carries a tamper-proof cryptographic QR seal instantly verifiable by admissions committees and music academies.'}
            </p>
          </div>

          <div className="border border-[#000000] p-6 bg-[#dedede]">
            <span className="font-mono text-xs text-[#757580] block mb-2">03 // PEDAGOGY RESPECT</span>
            <h3 className="text-xl font-serif text-[#000000] mb-3">
              {locale === 'ru' ? '20% поддержка педагогов' : '20% Teacher Endorsement'}
            </h3>
            <p className="text-sm font-serif text-[#121212] leading-relaxed">
              {locale === 'ru'
                ? 'Мы признаем решающий вклад преподавателей в развитие учеников и направляем 20% взноса на прямую финансовую поддержку наставников.'
                : 'We honor the pivotal role of music educators by returning 20% of entry fees directly as professional teacher royalties.'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Legal Entity */}
      <div className="border border-[#000000] p-8 sm:p-12 bg-[#dedede] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#757580] block mb-1">
            HEADQUARTERS & CONTACTS
          </span>
          <h3 className="text-xl font-serif text-[#000000] mb-2">
            {locale === 'ru' ? 'Служба аккредитации и оргкомитет espressivo ART' : 'Accreditation Office & espressivo ART Board'}
          </h3>
          <p className="text-xs sm:text-sm font-serif text-[#121212]">
            {locale === 'ru' ? 'Электронная почта:' : 'Email:'}{' '}
            <span className="font-mono text-[#000000]">adjudication@espressivo-art.com</span>
            <br />
            {locale === 'ru'
              ? 'Режим работы секретариата: Пн–Пт, 10:00 – 19:00 CET'
              : 'Secretariat Working Hours: Mon–Fri, 10:00 – 19:00 CET'}
          </p>
        </div>

        <Link href="/register">
          <Button variant="solid-ink" size="lg" className="shrink-0">
            {locale === 'ru' ? 'Подать заявку на конкурс' : 'Apply for Competition'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
