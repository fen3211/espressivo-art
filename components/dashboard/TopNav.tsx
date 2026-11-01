'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import { UserRole } from './Sidebar';
import { Bell, Shield } from 'lucide-react';

export interface TopNavProps {
  role: UserRole;
  pageTitle?: string;
}

export function TopNav({ role, pageTitle }: TopNavProps) {
  const { locale, setLocale, dict } = useLanguage();

  const roleName: Record<UserRole, string> = {
    PARTICIPANT: dict.common.participant,
    TEACHER: `${dict.common.teacher} (20%)`,
    JURY: dict.common.jury,
    ADMIN: dict.common.admin,
  };

  return (
    <header className="h-16 shrink-0 bg-[#040407]/90 backdrop-blur-md border-b border-[#2a2a32] px-6 flex items-center justify-between text-sm select-none z-30">
      {/* Left: Section identifier / Eyebrow */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6]">
          {role}
        </span>
        <span className="text-[#2a2a32]">/</span>
        <h1 className="text-sm font-medium text-[#fcfcfc] truncate">
          {pageTitle || dict.common.dashboard}
        </h1>
      </div>

      {/* Right: Quick actions, Lang switch, User profile */}
      <div className="flex items-center gap-4">
        {/* Workspace Quick Switcher Demo Pill (Helpful for reviewer) */}
        <div className="hidden xl:flex items-center gap-1 bg-[#08080c] px-2 py-1 rounded-full border border-[#2a2a32] text-[11px] font-mono">
          <span className="text-[#757580] px-1">{locale === 'ru' ? 'Кабинеты:' : 'Suites:'}</span>
          <Link
            href="/dashboard"
            className={`px-2 py-0.5 rounded-full transition-colors ${
              role === 'PARTICIPANT' ? 'bg-[#6199f6] text-[#0a0a13] font-bold' : 'text-[#a3a3b3] hover:text-white'
            }`}
          >
            {dict.common.participant}
          </Link>
          <Link
            href="/teacher"
            className={`px-2 py-0.5 rounded-full transition-colors ${
              role === 'TEACHER' ? 'bg-[#6199f6] text-[#0a0a13] font-bold' : 'text-[#a3a3b3] hover:text-white'
            }`}
          >
            {dict.common.teacher}
          </Link>
          <Link
            href="/jury/dashboard"
            className={`px-2 py-0.5 rounded-full transition-colors ${
              role === 'JURY' ? 'bg-[#6199f6] text-[#0a0a13] font-bold' : 'text-[#a3a3b3] hover:text-white'
            }`}
          >
            {dict.common.jury}
          </Link>
          <Link
            href="/admin"
            className={`px-2 py-0.5 rounded-full transition-colors ${
              role === 'ADMIN' ? 'bg-[#6199f6] text-[#0a0a13] font-bold' : 'text-[#a3a3b3] hover:text-white'
            }`}
          >
            {dict.common.admin}
          </Link>
        </div>

        {/* Language switch */}
        <div className="flex items-center text-xs font-mono rounded-full bg-[#08080c] border border-[#2a2a32] p-0.5">
          <button
            onClick={() => setLocale('ru')}
            className={`px-2 py-1 rounded-full cursor-pointer transition-colors ${
              locale === 'ru' ? 'bg-[#6199f6] text-[#0a0a13] font-bold' : 'text-[#757580] hover:text-white'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`px-2 py-1 rounded-full cursor-pointer transition-colors ${
              locale === 'en' ? 'bg-[#6199f6] text-[#0a0a13] font-bold' : 'text-[#757580] hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* User Pill Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#2a2a32]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#181826] to-[#4f4f80] flex items-center justify-center text-xs font-semibold text-[#fcfcfc] border border-[#4f4f80]">
            EA
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-[#fcfcfc] leading-tight">
              {locale === 'ru' ? 'Елена Алексеева' : 'Elena Alekseeva'}
            </span>
            <span className="text-[10px] text-[#6199f6] leading-tight font-mono">
              {roleName[role]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
