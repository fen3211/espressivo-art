'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';

export function Footer() {
  const { locale } = useLanguage();

  return (
    <footer className="w-full bg-[#e7e7e7] border-t border-[#000000] text-[#000000] font-serif pt-16 pb-12 px-6 sm:px-10">
      <div className="max-w-[1440px] mx-auto">
        {/* Main Monograph / Colophon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#000000]/20">
          {/* Colophon Stamp (Left) */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-serif tracking-tight text-[#000000] mb-3">
                espressivo ART
              </div>
              <p className="text-sm font-serif text-[#121212] leading-relaxed max-w-sm">
                {locale === 'ru'
                  ? 'Международный институт академических и современных творческих конкурсов. Экспертная судейская коллегия европейских консерваторий. Высокие стандарты аудио-видео экспертизы.'
                  : 'International institute of academic and contemporary creative competitions. Expert adjudicating board of European conservatories. Uncompromising standards of audio-visual adjudication.'}
              </p>
            </div>

            <div className="mt-8 text-[10px] font-sans uppercase font-bold tracking-[0.038em] text-[#121212]">
              FOUNDATION CHARTER • REG. EXP-INT-2026
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 flex flex-col gap-3 font-sans">
            <span className="text-[10px] uppercase font-bold tracking-[0.038em] text-[#000000] mb-2">
              {locale === 'ru' ? 'Навигация' : 'Index'}
            </span>
            <Link
              href="/competitions"
              className="text-xs text-[#121212] hover:text-[#000000] hover:underline"
            >
              {locale === 'ru' ? 'Каталог конкурсов' : 'All Competitions'}
            </Link>
            <Link
              href="/competitions/espressivo-vocal-young-talents/nominations"
              className="text-xs text-[#121212] hover:text-[#000000] hover:underline"
            >
              {locale === 'ru' ? 'Номинации и регламент' : 'Nominations & Specs'}
            </Link>
            <Link
              href="/jury"
              className="text-xs text-[#121212] hover:text-[#000000] hover:underline"
            >
              {locale === 'ru' ? 'Международное жюри' : 'International Jury'}
            </Link>
            <Link
              href="/about"
              className="text-xs text-[#121212] hover:text-[#000000] hover:underline"
            >
              {locale === 'ru' ? 'О платформе espressivo' : 'About Platform'}
            </Link>
          </div>

          {/* Legal & Compliance */}
          <div className="md:col-span-4 flex flex-col gap-3 font-sans">
            <span className="text-[10px] uppercase font-bold tracking-[0.038em] text-[#000000] mb-2">
              {locale === 'ru' ? 'Правовая информация' : 'Compliance & Legal'}
            </span>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link href="/terms" className="text-[#121212] hover:text-[#000000] hover:underline">
                {locale === 'ru' ? 'Публичная оферта и правила' : 'Terms of Service & Offer'}
              </Link>
              <Link href="/privacy" className="text-[#121212] hover:text-[#000000] hover:underline">
                {locale === 'ru' ? 'Политика конфиденциальности (152-ФЗ)' : 'Privacy Policy (152-FZ / GDPR)'}
              </Link>
              <Link href="/legal/consent" className="text-[#121212] hover:text-[#000000] hover:underline">
                {locale === 'ru' ? 'Согласие законного представителя' : 'Parental Minor Consent'}
              </Link>
            </div>
            <div className="mt-2 text-xs text-[#121212]">
              Email: <span className="font-mono text-[#000000]">director@espressivo-art.com</span>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-baseline justify-between gap-4 font-sans text-[10px] uppercase tracking-[0.033em] text-[#121212]">
          <div>
            © {new Date().getFullYear()} espressivo ART International. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>QUIET EDITORIAL REALM</span>
            <span>NO SHADOWS • 0PX RADIUS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
