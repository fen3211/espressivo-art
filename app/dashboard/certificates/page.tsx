'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Award, ShieldCheck, QrCode } from 'lucide-react';

export default function CertificatesPage() {
  const certificateData = {
    number: 'ESP-VOC-2026-0089-L1',
    participantName: 'Алексеева София Андреевна',
    competitionTitle: 'espressivo VOCAL — Young Talents (Season 2026)',
    nominationTitle: 'Эстрадный вокал (Соло) • Группа II (12–14 лет)',
    awardDegree: 'Лауреат I степени',
    teacherName: 'Иванова Анна Сергеевна',
    issueDate: '02.05.2026',
    presidentJury: 'Проф. Вальтер Кауфманн (Венская опера)',
  };

  const handleDownloadPdf = () => {
    alert(`Формирование защищенного полиграфического PDF диплома #${certificateData.number}`);
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
            Электронные дипломы и сертификаты
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            Официальные международные дипломы с верификационным QR-кодом
          </p>
        </div>

        <Button
          variant="iris-action"
          size="md"
          iconLeft={<Download className="w-4 h-4" />}
          onClick={handleDownloadPdf}
        >
          Скачать диплом (PDF)
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
            МЕЖДУНАРОДНЫЙ ИНСТИТУТ ТВОРЧЕСКИХ КОНКУРСОВ
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
            ОФИЦИАЛЬНЫЙ ДИПЛОМ
          </div>
          <div className="text-3xl sm:text-4xl font-serif text-[#000000] font-normal">
            {certificateData.awardDegree}
          </div>
        </div>

        {/* Recipient */}
        <div className="text-center space-y-3 mb-10">
          <div className="text-xs font-sans uppercase tracking-wider text-[#757580]">
            НАГРАЖДАЕТСЯ
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#000000]">
            {certificateData.participantName}
          </div>
          <div className="text-sm sm:text-base font-serif text-[#121212]">
            {certificateData.nominationTitle}
          </div>
          <div className="text-xs font-serif text-[#757580]">
            Преподаватель: {certificateData.teacherName}
          </div>
        </div>

        {/* Bottom Colophon Row */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-8 border-t border-[#000000]/20 text-xs">
          <div>
            <div className="font-mono text-[10px] text-[#757580]">СЕРИЯ И НОМЕР БЛАНКА:</div>
            <div className="font-mono font-bold text-sm text-[#000000]">
              {certificateData.number}
            </div>
            <div className="text-[10px] text-[#757580] mt-0.5">
              Дата выдачи: {certificateData.issueDate}
            </div>
          </div>

          <div className="text-center">
            <div className="font-serif italic text-sm text-[#000000]">Walter Kaufmann</div>
            <div className="text-[10px] uppercase font-sans tracking-wider text-[#757580] border-t border-[#000000] pt-1 mt-1">
              {certificateData.presidentJury}
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
