'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { locale } = useLanguage();

  return (
    <div className="max-w-[1000px] mx-auto px-6 sm:px-10 py-16 font-serif text-[#000000]">
      {/* Breadcrumb */}
      <div className="border-b border-[#000000] pb-6 mb-12">
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase font-bold tracking-widest text-[#757580] mb-3">
          <Link href="/" className="hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{locale === 'ru' ? 'Главная' : 'Home'}</span>
          </Link>
          <span>/</span>
          <span>LEGAL // PRIVACY & 152-FZ</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif text-[#000000] tracking-tight">
          {locale === 'ru'
            ? 'Политика обработки персональных данных (152-ФЗ / GDPR)'
            : 'Personal Data Processing Policy (152-FZ / GDPR)'}
        </h1>
        <p className="text-sm font-sans uppercase tracking-widest text-[#757580] mt-3">
          {locale === 'ru'
            ? 'Федеральный закон № 152-ФЗ • Защита прав несовершеннолетних'
            : 'Russian Federal Law No. 152-FZ • Protection of Minors Data'}
        </p>
      </div>

      <div className="space-y-10 leading-relaxed text-base text-[#121212]">
        <div className="border-l-2 border-[#000000] pl-6 py-2 bg-[#dedede] font-sans text-xs text-[#121212]">
          <strong>{locale === 'ru' ? 'Принцип Privacy by Design:' : 'Privacy by Design Principle:'}</strong>{' '}
          {locale === 'ru'
            ? 'Платформа espressivo ART проектировалась с приоритетом абсолютной защиты персональных данных несовершеннолетних конкурсантов. Все медиаматериалы изолированы, а судейская коллегия оценивает обезличенные аудиозаписи.'
            : 'espressivo ART is built around strict data minimization and minor protection. All video submissions are protected against unauthorized discovery, and adjudicators score blinded audio sessions.'}
        </div>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#000000]/20 pb-2">
            1. {locale === 'ru' ? 'Категории обрабатываемых данных' : 'Categories of Processed Data'}
          </h2>
          <p>
            {locale === 'ru'
              ? '1.1. В отношении несовершеннолетних участников обрабатываются исключительно: фамилия, имя, отчество, дата рождения (для подтверждения возрастной категории), наименование учебного заведения, аудио-видеозапись выступления и набранные баллы.'
              : '1.1. In relation to youth contestants, we process strictly: full name, date of birth (for age division qualification), music academy affiliation, performance video recording, and aggregated evaluation scores.'}
          </p>
          <p>
            {locale === 'ru'
              ? '1.2. В отношении законных представителей: фамилия, имя, отчество, контактный телефон, адрес электронной почты.'
              : '1.2. In relation to legal guardians: full name, contact telephone number, and verified email address.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#000000]/20 pb-2">
            2. {locale === 'ru' ? 'Изоляция данных от судейской коллегии' : 'Data Isolation & Blind Adjudication'}
          </h2>
          <p>
            {locale === 'ru'
              ? '2.1. На этапе оценки члены жюри получают доступ к интерфейсу через защищенный шлюз, скрывающий фамилии детей, контакты родителей и название школы. В судейском протоколе отображается только уникальный зашифрованный код заявки (например, EXP-2026-0042) и хронометраж.'
              : '2.1. During evaluation, adjudicators access a hardened gateway stripping all participant identity, parent contacts, and institutional affiliations. The evaluation protocol exposes solely the cryptographic code (e.g. EXP-2026-0042) and duration.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#000000]/20 pb-2">
            3. {locale === 'ru' ? 'Права субъекта персональных данных' : 'Rights of Data Subjects'}
          </h2>
          <p>
            {locale === 'ru'
              ? '3.1. Родитель или законный представитель вправе в любой момент отозвать согласие на обработку данных, направить запрос на уточнение или уничтожение персональных данных, направив официальное заявление на privacy@espressivo-art.com.'
              : '3.1. Legal guardians retain the right to inspect, correct, or revoke consent for data processing by sending an official request to privacy@espressivo-art.com.'}
          </p>
        </section>
      </div>
    </div>
  );
}
