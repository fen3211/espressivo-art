'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function LegalConsentPage() {
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
          <span>LEGAL // PARENTAL CONSENT</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif text-[#000000] tracking-tight">
          {locale === 'ru'
            ? 'Согласие родителя на обработку персональных данных несовершеннолетнего'
            : 'Parental Consent for Minor Personal Data Processing'}
        </h1>
        <p className="text-sm font-sans uppercase tracking-widest text-[#757580] mt-3">
          {locale === 'ru'
            ? 'Форма волеизъявления законного представителя • Ст. 9, 10.1 152-ФЗ'
            : 'Statutory Declaration • Articles 9 & 10.1 Russian Federal Law 152-FZ'}
        </p>
      </div>

      <div className="space-y-10 leading-relaxed text-base text-[#121212]">
        <section className="space-y-4">
          <p>
            {locale === 'ru'
              ? 'Я, действуя свободно, своей волей и в своем интересе, а также являясь законным представителем (родителем / усыновителем / опекуном) несовершеннолетнего участника конкурса, настоящим даю свое конкретное, предметное, информированное, сознательное и однозначное согласие ООО «Эспрессиво АРТ» на обработку персональных данных моего несовершеннолетнего ребенка.'
              : 'Acting freely and in the best interests of the youth participant as their legal parent or guardian, I hereby provide explicit, informed, and unambiguous consent to espressivo ART LLC for processing the personal data of my minor child.'}
          </p>
          <p>
            {locale === 'ru'
              ? 'Согласие распространяется на действия, необходимые для проведения независимой оценки выступления, включения в конкурсный протокол, изготовления и проверки подлинности диплома международного образца.'
              : 'This consent encompasses all operational tasks necessary for independent adjudication, ranking calculation, and cryptographic diploma issuance and verification.'}
          </p>
        </section>
      </div>
    </div>
  );
}
