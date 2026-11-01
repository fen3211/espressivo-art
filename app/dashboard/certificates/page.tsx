'use client';

import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Download, QrCode } from 'lucide-react';

export default function CertificatesPage() {
  const { locale, dict } = useLanguage();

  const certificateData = {
    number: 'ESP-VOC-2026-0089-L1',
    participantNameRu: 'Алексеева София Андреевна',
    participantNameEn: 'Sofia Alekseeva',
    competitionTitle: 'espressivo VOCAL — Young Talents (Season 2026)',
    nominationTitleRu: 'Эстрадный вокал (Соло) • Группа II (12–14 лет)',
    nominationTitleEn: 'Pop & Contemporary Vocal (Solo) • Group II (12–14 yrs)',
    awardDegree: dict.awards.LAUREATE_1,
    teacherNameRu: 'Иванова Анна Сергеевна',
    teacherNameEn: 'Anna Ivanova',
    issueDate: '02.05.2026',
    presidentJuryRu: 'Проф. Вальтер Кауфманн (Венская опера)',
    presidentJuryEn: 'Prof. Walter Kaufmann (Vienna State Opera)',
  };

  const handleDownloadPdf = () => {
    alert(
      locale === 'ru'
        ? `Формирование защищенного полиграфического PDF диплома #${certificateData.number}`
        : `Generating secure high-resolution print PDF diploma #${certificateData.number}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            CREDENTIAL REPOSITORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            {locale === 'ru' ? 'Электронные дипломы и сертификаты' : 'Digital Diplomas & Certificates'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {locale === 'ru'
              ? 'Официальные международные дипломы с верификационным QR-кодом'
              : 'Official international certificates with verified QR credentials'}
          </p>
        </div>

        <Button
          variant="iris-action"
          size="md"
          iconLeft={<Download className="w-4 h-4" />}
          onClick={handleDownloadPdf}
        >
          {dict.dashboard.details.downloadDiploma}
        </Button>
      </div>

      {/* Diploma Preview Sheet (Noble Bone card rendered inside Midnight Cinema) */}
      <div className="relative rounded-[10px] bg-[#e7e7e7] text-[#000000] p-8 sm:p-14 border-4 border-[#000000] shadow-[0_24px_64px_rgba(0,0,0,0.6)] font-serif select-none overflow-hidden">
        {/* Decorative corner borders */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#000000]" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#000000]" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#000000]" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#000000]" />

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-sans uppercase font-bold tracking-[0.038em] text-[#121212]">
            {locale === 'ru'
              ? 'МЕЖДУНАРОДНЫЙ ИНСТИТУТ ТВОРЧЕСКИХ КОНКУРСОВ'
              : 'INTERNATIONAL INSTITUTE OF COMPETITIVE ARTS'}
          </div>
          <div className="text-3xl sm:text-5xl font-serif tracking-tight text-[#000000]">
            espressivo ART
          </div>
          <div className="text-sm font-sans uppercase tracking-widest text-[#757580] pt-1">
            {certificateData.competitionTitle}
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center my-8 py-4 border-y border-[#000000]/20">
          <div className="text-xs font-sans uppercase font-bold tracking-[0.05em] text-[#121212] mb-1">
            {locale === 'ru' ? 'ОФИЦИАЛЬНЫЙ ДИПЛОМ' : 'OFFICIAL DIPLOMA'}
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-[#000000] font-normal">
            {certificateData.awardDegree}
          </div>
        </div>

        {/* Recipient */}
        <div className="text-center space-y-3 mb-10">
          <div className="text-xs font-sans uppercase tracking-wider text-[#757580]">
            {locale === 'ru' ? 'НАГРАЖДАЕТСЯ' : 'CONFERRED UPON'}
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#000000]">
            {locale === 'ru' ? certificateData.participantNameRu : certificateData.participantNameEn}
          </div>
          <div className="text-sm sm:text-base font-serif text-[#121212]">
            {locale === 'ru' ? certificateData.nominationTitleRu : certificateData.nominationTitleEn}
          </div>
          <div className="text-xs font-serif text-[#757580]">
            {locale === 'ru' ? 'Преподаватель: ' : 'Instructor: '}
            {locale === 'ru' ? certificateData.teacherNameRu : certificateData.teacherNameEn}
          </div>
        </div>

        {/* Bottom Colophon Row */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-8 border-t border-[#000000]/20 text-xs">
          <div>
            <div className="font-mono text-[10px] text-[#757580]">
              {locale === 'ru' ? 'СЕРИЯ И НОМЕР БЛАНКА:' : 'REGISTRATION NUMBER:'}
            </div>
            <div className="font-mono font-bold text-sm text-[#000000]">
              {certificateData.number}
            </div>
            <div className="text-[10px] text-[#757580] mt-0.5">
              {locale === 'ru' ? 'Дата выдачи: ' : 'Issue Date: '}
              {certificateData.issueDate}
            </div>
          </div>

          <div className="text-center">
            <div className="font-serif italic text-sm text-[#000000]">Walter Kaufmann</div>
            <div className="text-[10px] uppercase font-sans tracking-wider text-[#757580] border-t border-[#000000] pt-1 mt-1">
              {locale === 'ru' ? certificateData.presidentJuryRu : certificateData.presidentJuryEn}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#ffffff] border border-[#000000] flex items-center justify-center p-1">
              <QrCode className="w-12 h-12 text-[#000000]" />
            </div>
            <span className="text-[8px] font-mono uppercase tracking-widest text-[#757580] mt-1">
              VERIFIED QR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
