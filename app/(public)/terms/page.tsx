'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <span>LEGAL // PUBLIC OFFER</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif text-[#000000] tracking-tight">
          {locale === 'ru'
            ? 'Публичная оферта и Пользовательское соглашение'
            : 'Terms of Service & Public Offer'}
        </h1>
        <p className="text-sm font-sans uppercase tracking-widest text-[#757580] mt-3">
          {locale === 'ru'
            ? 'Редакция 1.0 от 01 ноября 2026 г. • Ст. 435, 437 ГК РФ'
            : 'Edition 1.0, November 2026 • Statutory Civil Code Articles 435, 437'}
        </p>
      </div>

      <div className="space-y-10 leading-relaxed text-base text-[#121212]">
        <div className="border-l-2 border-[#000000] pl-6 py-2 bg-[#dedede] font-sans text-xs text-[#121212]">
          <strong>{locale === 'ru' ? 'Правовой статус оферты:' : 'Legal Notice:'}</strong>{' '}
          {locale === 'ru'
            ? 'Настоящий документ является официальным предложением ООО «Эспрессиво АРТ» физическим лицам (родителям, законным представителям) заключить договор возмездного оказания услуг по организации участия в международном творческом конкурсе espressivo VOCAL — Young Talents.'
            : 'This document constitutes an official public offer of espressivo ART LLC to individuals (parents and legal guardians) for organizing, adjudicating, and certifying participation in international creative competitions.'}
        </div>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#000000]/20 pb-2">
            1. {locale === 'ru' ? 'Предмет соглашения' : 'Subject of Agreement'}
          </h2>
          <p>
            {locale === 'ru'
              ? '1.1. Организатор обязуется оказать Заказчику комплекс культурно-просветительских, организационных и экспертно-оценочных услуг по организации участия Участника (несовершеннолетнего или молодого исполнителя в возрасте 5–25 лет) в Конкурсе, включая прием электронной заявки, обеспечение независимой судейской экспертизы консерваторским жюри по 100-балльной системе и выдачу официального двуязычного диплома с криптографическим QR-кодом валидации.'
              : '1.1. The Organizer agrees to provide comprehensive cultural, organizational, and adjudication services for the Participant (aged 5–25) in the Competition, including application processing, independent blinded evaluation by conservatory professors using the 100-point rubric, and issuance of official verified diplomas with dynamic QR credentials.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#000000]/20 pb-2">
            2. {locale === 'ru' ? 'Порядок акцепта и оплата оргвзноса' : 'Acceptance & Entry Fees'}
          </h2>
          <p>
            {locale === 'ru'
              ? '2.1. Акцептом настоящей оферты признается совокупность следующих действий: заполнение электронной регистрационной формы, подтверждение раздельных согласий на обработку ПДн (ст. 9 152-ФЗ) и оплата организационного взноса.'
              : '2.1. Full acceptance is constituted by completing registration, submitting statutory 152-FZ / GDPR minor data processing consent, and settling the contest registration fee.'}
          </p>
          <p>
            {locale === 'ru'
              ? '2.2. Размер организационного взноса составляет: Сольное участие — 2 500 рублей; Вокальный ансамбль или дуэт — 4 500 рублей. Оплата производится через защищенный платежный шлюз с фискализацией чека по 54-ФЗ.'
              : '2.2. Registration fees: Solo Entry — 2,500 RUB; Ensemble / Duet — 4,500 RUB. Payment is transacted via compliant secure gateways with statutory electronic receipts.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#000000]/20 pb-2">
            3. {locale === 'ru' ? 'Регламент оценивания и академическая честность' : 'Adjudication Standards & Integrity'}
          </h2>
          <p>
            {locale === 'ru'
              ? '3.1. Оценивание конкурсных выступлений осуществляется по регламенту «Слепого прослушивания» (Blind Audition). Члены жюри не имеют доступа к фамилиям, именам, учебным заведениям и городам проживания несовершеннолетних участников до момента публикации итогового протокола.'
              : '3.1. Adjudication operates under strict Blind Audition protocols. Jury members do not receive participant names, music institutions, or geographic origins, ensuring impartial scoring.'}
          </p>
          <p>
            {locale === 'ru'
              ? '3.2. Решение жюри является окончательным, пересмотру и апелляциям не подлежит, за исключением случаев выявления технических ошибок протокола.'
              : '3.2. Jury decisions and award determinations are final and non-appealable, except in substantiated cases of technical transmission discrepancy.'}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-serif text-[#000000] font-normal border-b border-[#000000]/20 pb-2">
            4. {locale === 'ru' ? 'Реквизиты Организатора' : 'Corporate Details'}
          </h2>
          <div className="font-mono text-xs text-[#121212] bg-[#dedede] p-4 border border-[#000000]">
            <div>ООО «Эспрессиво АРТ» / espressivo ART LLC</div>
            <div>ОГРН: 1267700123456 • ИНН: 7701987654 / КПП: 770101001</div>
            <div>119019, г. Москва, ул. Знаменка, д. 19 (Культурный кластер)</div>
            <div>Email: director@espressivo-art.com • support@espressivo-art.com</div>
          </div>
        </section>
      </div>
    </div>
  );
}
