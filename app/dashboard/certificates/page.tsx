'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Download, QrCode, CheckCircle2 } from 'lucide-react';

interface CertificateInfo {
  applicationId: string;
  number: string;
  participantNameRu: string;
  participantNameEn: string;
  competitionTitle: string;
  nominationTitleRu: string;
  nominationTitleEn: string;
  awardDegree: string;
  teacherNameRu: string;
  teacherNameEn: string;
  issueDate: string;
  presidentJuryRu: string;
  presidentJuryEn: string;
  qrCodeToken: string;
}

export default function CertificatesPage() {
  const { locale, dict } = useLanguage();
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [certificateData, setCertificateData] = useState<CertificateInfo>({
    applicationId: '',
    number: 'ESP-VOC-2026-1005-LAUR1',
    participantNameRu: 'Екатерина Воронова',
    participantNameEn: 'Ekaterina Voronova',
    competitionTitle: 'espressivo VOCAL — Young Talents (Season 2026)',
    nominationTitleRu: 'Академический вокал (Соло) • Категория D (18–25 лет)',
    nominationTitleEn: 'Classical Vocal (Solo) • Category D (18–25 yrs)',
    awardDegree: dict.awards.LAUREATE_1,
    teacherNameRu: 'Мария Александровна Смирнова',
    teacherNameEn: 'Maria Smirnova',
    issueDate: '01.06.2026',
    presidentJuryRu: 'Проф. Вальтер Кауфманн (Венская опера)',
    presidentJuryEn: 'Prof. Walter Kaufmann (Vienna State Opera)',
    qrCodeToken: 'cert_token_voronova_2026',
  });

  useEffect(() => {
    async function loadCertificates() {
      try {
        const res = await fetch('/api/applications');
        if (res.ok) {
          const apps = await res.json();
          const appWithCert = apps.find((a: any) => a.certificate || a.status === 'COMPLETED');
          if (appWithCert) {
            setCertificateData((prev) => ({
              ...prev,
              applicationId: appWithCert.id,
              number: appWithCert.certificate?.certificateNumber || prev.number,
              participantNameRu: appWithCert.participantName || prev.participantNameRu,
              nominationTitleRu: appWithCert.nomination?.titleRu || prev.nominationTitleRu,
              nominationTitleEn: appWithCert.nomination?.titleEn || prev.nominationTitleEn,
              awardDegree: appWithCert.certificate?.awardDegree ? (dict.awards[appWithCert.certificate.awardDegree as keyof typeof dict.awards] || appWithCert.certificate.awardDegree) : prev.awardDegree,
              teacherNameRu: appWithCert.teacherName || prev.teacherNameRu,
              qrCodeToken: appWithCert.certificate?.qrCodeToken || prev.qrCodeToken,
            }));
          } else if (apps.length > 0) {
            setCertificateData((prev) => ({
              ...prev,
              applicationId: apps[0].id,
            }));
          }
        }
      } catch (e) {
        console.error('Failed to load certificate from API:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCertificates();
  }, [dict]);

  const handleDownloadPdf = async () => {
    if (!certificateData.applicationId) {
      window.open('/api/certificates/dummy/download', '_blank');
      return;
    }
    setDownloading(true);
    try {
      window.location.href = `/api/certificates/${certificateData.applicationId}/download`;
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            CREDENTIAL REPOSITORY // VERIFIED PDF
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            {locale === 'ru' ? 'Электронные дипломы и сертификаты' : 'Digital Diplomas & Certificates'}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {locale === 'ru'
              ? 'Официальные международные дипломы с криптографическим QR-кодом для мгновенной валидации'
              : 'Official international certificates with cryptographic QR credentials for instant validation'}
          </p>
        </div>

        <Button
          variant="iris-action"
          size="md"
          loading={downloading}
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
            <div className="font-mono text-[10px] text-[#757580] mt-1">
              {locale === 'ru' ? 'ДАТА ВЫДАЧИ: ' : 'DATE OF ISSUE: '}
              {certificateData.issueDate}
            </div>
          </div>

          {/* QR Verification badge */}
          <div className="flex items-center gap-3 bg-[#ffffff] p-2 border border-[#000000]">
            <QrCode className="w-10 h-10 text-[#000000]" />
            <div className="text-left">
              <div className="font-sans font-bold text-[9px] uppercase tracking-wider text-[#000000] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                {locale === 'ru' ? 'ВЕРИФИЦИРОВАНО' : 'VERIFIED DIPLOMA'}
              </div>
              <a
                href={`/verify/${certificateData.qrCodeToken}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[8px] text-[#6199f6] hover:underline"
              >
                /verify/{certificateData.qrCodeToken.slice(0, 16)}...
              </a>
            </div>
          </div>

          <div className="text-right">
            <div className="font-serif italic text-xs text-[#000000]">
              {locale === 'ru' ? certificateData.presidentJuryRu : certificateData.presidentJuryEn}
            </div>
            <div className="font-sans text-[9px] uppercase tracking-wider text-[#757580]">
              {locale === 'ru' ? 'Председатель международного жюри' : 'Head of the International Jury'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
