'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/competitions', labelRu: 'Конкурсы', labelEn: 'Competitions' },
    { href: '/competitions/espressivo-vocal-young-talents/nominations', labelRu: 'Номинации', labelEn: 'Nominations' },
    { href: '/competitions/espressivo-vocal-young-talents/rules', labelRu: 'Регламент', labelEn: 'Rules' },
    { href: '/jury', labelRu: 'Жюри', labelEn: 'Jury' },
    { href: '/about', labelRu: 'О платформе', labelEn: 'About' },
  ];

  return (
    <header className="w-full bg-[#e7e7e7] border-b border-[#000000]/10 sticky top-0 z-40 transition-colors">
      <div className="max-w-[1440px] mx-auto h-14 px-6 sm:px-10 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="text-xl sm:text-2xl font-serif text-[#000000] tracking-tight hover:opacity-75 transition-opacity"
        >
          espressivo <span className="font-normal">ART</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[10px] uppercase font-sans font-medium tracking-[0.033em] text-[#000000] pb-0.5 transition-all duration-150 ${
                  isActive
                    ? 'border-b-2 border-[#000000] font-bold'
                    : 'border-b border-transparent hover:border-[#000000]'
                }`}
              >
                {locale === 'ru' ? item.labelRu : item.labelEn}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Lang + Auth CTA */}
        <div className="hidden lg:flex items-center gap-5">
          {/* Language Switcher */}
          <div className="flex items-center text-[10px] font-sans uppercase font-bold tracking-wider text-[#000000]">
            <button
              onClick={() => setLocale('ru')}
              className={`px-1.5 py-0.5 cursor-pointer ${
                locale === 'ru' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#757580] hover:text-[#000000]'
              }`}
            >
              RU
            </button>
            <span className="text-[#000000]/30">/</span>
            <button
              onClick={() => setLocale('en')}
              className={`px-1.5 py-0.5 cursor-pointer ${
                locale === 'en' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#757580] hover:text-[#000000]'
              }`}
            >
              EN
            </button>
          </div>

          <Link
            href="/login"
            className="text-[10px] uppercase font-sans font-medium tracking-[0.033em] text-[#000000] hover:underline"
          >
            {t('common.login')}
          </Link>

          <Link href="/register">
            <Button variant="solid-ink" size="sm">
              {locale === 'ru' ? 'Подать заявку' : 'Apply Now'}
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer"
          aria-label="Меню навигации"
        >
          <span
            className={`w-5 h-[1.5px] bg-[#000000] transition-transform duration-200 ${
              mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`w-5 h-[1.5px] bg-[#000000] transition-opacity duration-200 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-5 h-[1.5px] bg-[#000000] transition-transform duration-200 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#e7e7e7] border-b border-[#000000] px-6 py-6 flex flex-col gap-5 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-4">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase font-sans font-semibold tracking-wider text-[#000000]"
              >
                {locale === 'ru' ? item.labelRu : item.labelEn}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#000000]/20 flex items-center justify-between">
            <div className="flex items-center text-xs font-sans uppercase font-bold tracking-wider">
              <button
                onClick={() => setLocale('ru')}
                className={`px-2 py-1 ${locale === 'ru' ? 'bg-[#000000] text-white' : 'text-[#757580]'}`}
              >
                RU
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-1 ${locale === 'en' ? 'bg-[#000000] text-white' : 'text-[#757580]'}`}
              >
                EN
              </button>
            </div>

            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <span className="text-xs uppercase font-sans font-semibold text-[#000000]">
                {t('common.login')}
              </span>
            </Link>
          </div>

          <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
            <Button variant="solid-ink" fullWidth size="md">
              {locale === 'ru' ? 'Подать заявку' : 'Apply Now'}
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
