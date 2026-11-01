import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Award, CheckCircle2, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';

interface VerifyPageProps {
  params: Promise<{
    token: string;
  }>;
}

function maskMinorName(fullName: string): string {
  if (!fullName) return 'Участник конкурса';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return `${parts[0].slice(0, 1)}***`;
  }
  return `${parts[0]} ${parts[1].slice(0, 1)}.`;
}

export default async function CertificateVerificationPage(props: VerifyPageProps) {
  const { token } = await props.params;

  let certificate = null;
  if (token && token.length >= 16) {
    certificate = await prisma.certificate.findUnique({
      where: { qrCodeToken: token },
      include: {
        application: {
          select: {
            status: true,
          },
        },
      },
    });
  }

  const isValid = Boolean(certificate && certificate.application?.status !== 'REJECTED');

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <div className="max-w-xl mx-auto">
        {/* Editorial Frame */}
        <div className="border border-[#000000] p-8 sm:p-12 bg-[#faf8f5] shadow-sm relative">
          {/* Subtle corner accents */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#a38344]" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#a38344]" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#a38344]" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#a38344]" />

          {/* Top Registry Header */}
          <div className="text-center pb-6 border-b border-[#000000]/20 space-y-2">
            <span className="text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-[#a38344] block">
              ESPRESSIVO ART · OFFICIAL REGISTRY
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#000000]">
              Верификация диплома
            </h1>
            <p className="text-xs font-serif text-[#757580]">
              Официальное подтверждение подлинности наградного документа
            </p>
          </div>

          {isValid && certificate ? (
            <div className="py-8 space-y-6">
              {/* Verified Status Banner */}
              <div className="p-4 rounded border border-emerald-600 bg-emerald-50 text-emerald-900 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs font-sans">
                  <div className="font-bold uppercase tracking-wider">Подлинный документ</div>
                  <div className="text-emerald-800 text-[11px] mt-0.5">
                    Диплом зарегистрирован в официальном реестре конкурсов espressivo ART
                  </div>
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="space-y-4 text-xs font-serif text-[#121212]">
                <div className="flex justify-between items-baseline border-b border-[#e5e0d8] pb-2">
                  <span className="text-[#757580] uppercase tracking-wider font-sans text-[10px]">
                    Регистрационный номер
                  </span>
                  <span className="font-mono font-bold text-sm text-[#000000]">
                    {certificate.certificateNumber}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-[#e5e0d8] pb-2">
                  <span className="text-[#757580] uppercase tracking-wider font-sans text-[10px]">
                    Присужденная награда
                  </span>
                  <span className="font-sans font-bold text-sm text-[#a38344]">
                    {certificate.awardDegree} ({certificate.totalScore.toFixed(1)} баллов)
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-[#e5e0d8] pb-2">
                  <span className="text-[#757580] uppercase tracking-wider font-sans text-[10px]">
                    Участник (152-ФЗ)
                  </span>
                  <span className="font-sans font-semibold text-[#000000]">
                    {maskMinorName(certificate.participantName)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-[#e5e0d8] pb-2">
                  <span className="text-[#757580] uppercase tracking-wider font-sans text-[10px]">
                    Конкурс
                  </span>
                  <span className="text-right font-medium max-w-[260px]">
                    {certificate.competitionTitle}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-[#e5e0d8] pb-2">
                  <span className="text-[#757580] uppercase tracking-wider font-sans text-[10px]">
                    Номинация
                  </span>
                  <span className="text-right font-medium max-w-[260px]">
                    {certificate.nominationTitle}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-b border-[#e5e0d8] pb-2">
                  <span className="text-[#757580] uppercase tracking-wider font-sans text-[10px]">
                    Дата выдачи
                  </span>
                  <span className="font-mono text-[#555555]">
                    {new Date(certificate.issuedDate).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* 152-FZ Privacy Note */}
              <div className="p-3 bg-[#f0eae1] rounded text-[11px] font-sans text-[#666666] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#a38344] shrink-0 mt-0.5" />
                <span>
                  В соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных» и ст. 8 GDPR, полное имя несовершеннолетнего участника защищено от публичной индексации.
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 space-y-6 text-center">
              <div className="p-4 rounded border border-red-500 bg-red-50 text-red-900 flex items-center gap-3 text-left">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                <div className="text-xs font-sans">
                  <div className="font-bold uppercase tracking-wider">Диплом не найден</div>
                  <div className="text-red-800 text-[11px] mt-0.5">
                    Указанный токен отсутствует в официальном реестре платформы espressivo ART либо наградной документ был отозван.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div className="pt-6 border-t border-[#000000]/20 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-[#000000] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>На главную страницу espressivo ART</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
