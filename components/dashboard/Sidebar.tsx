'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Trophy,
  Award,
  User,
  Users,
  Wallet,
  Coins,
  ArrowUpRight,
  CheckSquare,
  Settings,
  Layers,
  BarChart3,
  Sliders,
  DollarSign,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export type UserRole = 'PARTICIPANT' | 'TEACHER' | 'JURY' | 'ADMIN';

export interface SidebarProps {
  role: UserRole;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  href: string;
  labelRu: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { locale, dict } = useLanguage();

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'PARTICIPANT':
        return [
          { href: '/dashboard', labelRu: 'Сводка', labelEn: 'Overview', icon: LayoutDashboard },
          { href: '/dashboard/applications', labelRu: 'Мои заявки', labelEn: 'My Entries', icon: FileText },
          { href: '/dashboard/applications/new', labelRu: 'Подать заявку', labelEn: 'New Entry', icon: PlusCircle },
          { href: '/dashboard/results', labelRu: 'Результаты', labelEn: 'Results', icon: Trophy },
          { href: '/dashboard/certificates', labelRu: 'Дипломы & Сертификаты', labelEn: 'Diplomas', icon: Award },
          { href: '/dashboard/profile', labelRu: 'Профиль', labelEn: 'Profile', icon: User },
        ];
      case 'TEACHER':
        return [
          { href: '/teacher', labelRu: 'Кабинет педагога', labelEn: 'Teacher Hub', icon: LayoutDashboard },
          { href: '/teacher/referrals', labelRu: 'Реферальная ссылка', labelEn: 'Referral Link', icon: ArrowUpRight, badge: '20%' },
          { href: '/teacher/participants', labelRu: 'Мои ученики', labelEn: 'Students', icon: Users },
          { href: '/teacher/earnings', labelRu: 'Журнал начислений', labelEn: 'Earnings Ledger', icon: Coins },
          { href: '/teacher/payouts', labelRu: 'Запросы выплат', labelEn: 'Payouts', icon: Wallet },
          { href: '/teacher/profile', labelRu: 'Профиль', labelEn: 'Profile', icon: User },
        ];
      case 'JURY':
        return [
          { href: '/jury/dashboard', labelRu: 'Терминал жюри', labelEn: 'Jury Hub', icon: LayoutDashboard },
          { href: '/jury/applications', labelRu: 'Очередь оценивания', labelEn: 'Evaluation Queue', icon: CheckSquare, badge: 'Active' },
          { href: '/jury/evaluations', labelRu: 'Архив оценок', labelEn: 'Submitted Scores', icon: Layers },
        ];
      case 'ADMIN':
        return [
          { href: '/admin', labelRu: 'KPI & Аналитика', labelEn: 'Overview', icon: BarChart3 },
          { href: '/admin/applications', labelRu: 'Модерация заявок', labelEn: 'Applications', icon: FileText },
          { href: '/admin/competitions', labelRu: 'Управление конкурсами', labelEn: 'Competitions', icon: Sliders },
          { href: '/admin/users', labelRu: 'Пользователи', labelEn: 'Users & Roles', icon: Users },
          { href: '/admin/results', labelRu: 'Расчет итогов', labelEn: 'Results & Awards', icon: Trophy },
          { href: '/admin/finance', labelRu: 'Реестр финансов', labelEn: 'Financial Registry', icon: DollarSign },
          { href: '/admin/payouts', labelRu: 'Одобрение выплат', labelEn: 'Payout Approvals', icon: Wallet },
        ];
    }
  };

  const navItems = getNavItems();

  const roleTitle: Record<UserRole, { ru: string; en: string }> = {
    PARTICIPANT: { ru: 'Кабинет Участника', en: 'Participant Suite' },
    TEACHER: { ru: 'Кабинет Педагога', en: 'Teacher Suite' },
    JURY: { ru: 'Коллегия Жюри', en: 'Jury Terminal' },
    ADMIN: { ru: 'Администрация', en: 'Admin Control' },
  };

  return (
    <aside className="w-64 shrink-0 bg-[#040407] border-r border-[#2a2a32] flex flex-col justify-between select-none">
      <div>
        {/* Workspace Brand / Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#2a2a32]">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6199f6] shadow-[0_0_8px_#6199f6]" />
            <span className="font-serif text-lg tracking-tight text-[#fcfcfc] group-hover:text-[#6199f6] transition-colors">
              espressivo <span className="font-sans text-xs tracking-widest text-[#a3a3b3]">PRO</span>
            </span>
          </Link>
        </div>

        {/* Role Stamp */}
        <div className="px-5 py-3 bg-[#08080c]/60 border-b border-[#2a2a32]/60">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#6199f6]">
            {roleTitle[role][locale === 'ru' ? 'ru' : 'en']}
          </div>
          <div className="text-[11px] text-[#757580] mt-0.5 font-sans">
            Midnight Cinema Suite v1.0
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-full text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#181826] text-[#6199f6] border border-[#4f4f80] shadow-[0_0_12px_rgba(97,153,246,0.15)] font-semibold'
                    : 'text-[#a3a3b3] hover:text-[#fcfcfc] hover:bg-[#08080c]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#6199f6]' : 'text-[#757580]'}`} />
                  <span>{locale === 'ru' ? item.labelRu : item.labelEn}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[rgba(97,153,246,0.15)] text-[#6199f6] border border-[rgba(97,153,246,0.3)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-[#2a2a32] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-[#757580] hover:text-[#fcfcfc] transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{dict.nav.publicPortal}</span>
          </span>
          <span className="font-mono text-[10px] text-[#4f4f80]">ART</span>
        </Link>

        <Link
          href="/login"
          className="flex items-center gap-2 px-3 py-2 rounded-full text-xs text-red-400/80 hover:text-red-300 hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{dict.nav.exitWorkspace}</span>
        </Link>
      </div>
    </aside>
  );
}
