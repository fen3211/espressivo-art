'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  DollarSign,
  FileText,
  Award,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function AdminDashboardPage() {
  const { dict } = useLanguage();

  const metrics = [
    {
      title: dict.admin.kpi.grossRevenue,
      value: '1 450 000 ₽',
      sub: dict.admin.dashboard.kpiSub.grossRevenue,
      icon: DollarSign,
      color: 'text-[#22c55e]',
    },
    {
      title: dict.admin.kpi.totalEntries,
      value: '580',
      sub: dict.admin.dashboard.kpiSub.totalEntries,
      icon: FileText,
      color: 'text-[#6199f6]',
    },
    {
      title: dict.admin.kpi.teacherLiabilities,
      value: '290 000 ₽',
      sub: dict.admin.dashboard.kpiSub.teacherLiabilities,
      icon: Wallet,
      color: 'text-[#eab308]',
    },
    {
      title: dict.admin.kpi.issuedDiplomas,
      value: '215',
      sub: dict.admin.dashboard.kpiSub.issuedDiplomas,
      icon: Award,
      color: 'text-[#dedfee]',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2a2a32]">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            {dict.admin.dashboard.tag}
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
            {dict.admin.dashboard.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
            {dict.admin.dashboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/results">
            <Button variant="iris-action" size="md" iconLeft={<Award className="w-4 h-4" />}>
              {dict.admin.dashboard.seasonResultsBtn}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} padding="md" className="flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs text-[#a3a3b3] uppercase font-mono">{m.title}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="mt-4">
                <div className={`text-3xl font-semibold font-mono ${m.color}`}>{m.value}</div>
                <div className="text-xs text-[#757580] mt-1">{m.sub}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* System Infrastructure Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md" className="flex items-center gap-4 bg-[#08080c]">
          <div className="w-10 h-10 rounded-full bg-[rgba(34,197,94,0.12)] border border-[#22c55e] flex items-center justify-center text-[#22c55e] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-[#757580]">{dict.admin.infrastructure.paymentGateway}</div>
            <div className="text-sm font-medium text-[#fcfcfc]">{dict.admin.infrastructure.paymentGatewayActive}</div>
            <div className="text-[11px] text-[#22c55e]">{dict.admin.dashboard.infra.gatewaySuccess}</div>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 bg-[#08080c]">
          <div className="w-10 h-10 rounded-full bg-[rgba(97,153,246,0.12)] border border-[#6199f6] flex items-center justify-center text-[#6199f6] shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-[#757580]">{dict.admin.dashboard.infra.videoCdn}</div>
            <div className="text-sm font-medium text-[#fcfcfc]">{dict.admin.dashboard.infra.videoEmbeds}</div>
            <div className="text-[11px] text-[#6199f6]">{dict.admin.dashboard.infra.videoProtected}</div>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 bg-[#08080c]">
          <div className="w-10 h-10 rounded-full bg-[rgba(234,179,8,0.12)] border border-[#eab308] flex items-center justify-center text-[#eab308] shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-[#757580]">{dict.admin.infrastructure.pendingPayouts}</div>
            <div className="text-sm font-medium text-[#fcfcfc]">{dict.admin.dashboard.infra.payoutTeacherCount}</div>
            <div className="text-[11px] text-[#eab308]">{dict.admin.infrastructure.pendingPayoutsNotice}</div>
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card interactive padding="lg" className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-[#fcfcfc]">
              {dict.admin.dashboard.cards.moderationTitle}
            </h3>
            <span className="text-xs font-mono text-[#6199f6] bg-[rgba(97,153,246,0.12)] px-2 py-0.5 rounded-full">
              {dict.admin.dashboard.cards.moderationBadge}
            </span>
          </div>
          <p className="text-xs text-[#a3a3b3] leading-relaxed">
            {dict.admin.dashboard.cards.moderationDesc}
          </p>
          <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-xs text-[#6199f6] font-mono hover:underline pt-2">
            <span>{dict.admin.dashboard.cards.moderationLink}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        <Card interactive padding="lg" className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-[#fcfcfc]">
              {dict.admin.dashboard.cards.payoutsTitle}
            </h3>
            <span className="text-xs font-mono text-[#eab308] bg-[rgba(234,179,8,0.12)] px-2 py-0.5 rounded-full">
              {dict.admin.dashboard.cards.payoutsBadge}
            </span>
          </div>
          <p className="text-xs text-[#a3a3b3] leading-relaxed">
            {dict.admin.dashboard.cards.payoutsDesc}
          </p>
          <Link href="/admin/payouts" className="inline-flex items-center gap-1.5 text-xs text-[#6199f6] font-mono hover:underline pt-2">
            <span>{dict.admin.dashboard.cards.payoutsLink}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
}
