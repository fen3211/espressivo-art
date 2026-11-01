'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Search } from 'lucide-react';

interface StudentRow extends Record<string, unknown> {
  id: string;
  code: string;
  studentNameRu: string;
  studentNameEn: string;
  nominationRu: string;
  nominationEn: string;
  categoryRu: string;
  categoryEn: string;
  applicationStatus: string;
  paymentStatus: string;
  fee: number;
  commission: number;
  registeredAt: string;
}

export default function TeacherParticipantsPage() {
  const { locale, dict } = useLanguage();
  const [search, setSearch] = useState('');

  const students: StudentRow[] = [
    {
      id: '1',
      code: 'EXP-2026-0042',
      studentNameRu: 'София Алексеева (13 лет)',
      studentNameEn: 'Sofia Alekseeva (13 yrs)',
      nominationRu: 'Академический вокал (Соло)',
      nominationEn: 'Academic Vocal (Solo)',
      categoryRu: 'Группа II (12–14 лет)',
      categoryEn: 'Group II (12–14 yrs)',
      applicationStatus: 'UNDER_REVIEW',
      paymentStatus: 'PAID',
      fee: 2500,
      commission: 500,
      registeredAt: '14.05.2026',
    },
    {
      id: '2',
      code: 'EXP-2026-0089',
      studentNameRu: 'София Алексеева (13 лет)',
      studentNameEn: 'Sofia Alekseeva (13 yrs)',
      nominationRu: 'Эстрадный вокал (Соло)',
      nominationEn: 'Pop & Contemporary Vocal (Solo)',
      categoryRu: 'Группа II (12–14 лет)',
      categoryEn: 'Group II (12–14 yrs)',
      applicationStatus: 'EVALUATED',
      paymentStatus: 'PAID',
      fee: 2500,
      commission: 500,
      registeredAt: '02.05.2026',
    },
    {
      id: '3',
      code: 'EXP-2026-0104',
      studentNameRu: 'Михаил Захаров (15 лет)',
      studentNameEn: 'Mikhail Zakharov (15 yrs)',
      nominationRu: 'Эстрадный вокал (Соло)',
      nominationEn: 'Pop & Contemporary Vocal (Solo)',
      categoryRu: 'Группа III (15–17 лет)',
      categoryEn: 'Group III (15–17 yrs)',
      applicationStatus: 'EVALUATED',
      paymentStatus: 'PAID',
      fee: 2500,
      commission: 500,
      registeredAt: '28.04.2026',
    },
    {
      id: '4',
      code: 'EXP-2026-0155',
      studentNameRu: 'Екатерина Морозова (9 лет)',
      studentNameEn: 'Ekaterina Morozova (9 yrs)',
      nominationRu: 'Джазовый вокал',
      nominationEn: 'Jazz Vocal',
      categoryRu: 'Группа I (9–11 лет)',
      categoryEn: 'Group I (9–11 yrs)',
      applicationStatus: 'PAYMENT_PENDING',
      paymentStatus: 'PENDING',
      fee: 2500,
      commission: 500,
      registeredAt: '20.05.2026',
    },
  ];

  const filtered = students.filter((s) => {
    const name = locale === 'ru' ? s.studentNameRu : s.studentNameEn;
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns: Column<StudentRow>[] = [
    {
      key: 'code',
      header: dict.teacher.tableHeaders.entryCode,
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'studentName',
      header: dict.teacher.tableHeaders.studentName,
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">
            {locale === 'ru' ? r.studentNameRu : r.studentNameEn}
          </div>
          <div className="text-xs text-[#757580]">
            {locale === 'ru' ? r.categoryRu : r.categoryEn}
          </div>
        </div>
      ),
    },
    {
      key: 'nomination',
      header: dict.teacher.tableHeaders.nomination,
      render: (r) => (
        <span className="text-sm text-[#dedfee]">
          {locale === 'ru' ? r.nominationRu : r.nominationEn}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: dict.teacher.tableHeaders.status,
      render: (r) => (
        <Badge
          status={r.paymentStatus === 'PAID' ? 'PAID' : 'PAYMENT_PENDING'}
        />
      ),
    },
    {
      key: 'commission',
      header: dict.teacher.tableHeaders.commissionEarned,
      render: (r) => (
        <span className={`font-mono text-sm font-semibold ${r.paymentStatus === 'PAID' ? 'text-[#22c55e]' : 'text-[#757580]'}`}>
          +{r.commission} ₽
        </span>
      ),
    },
    {
      key: 'registeredAt',
      header: dict.teacher.tableHeaders.date,
      render: (r) => <span className="text-xs text-[#757580]">{r.registeredAt}</span>,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          STUDENT REGISTRY
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          {locale === 'ru' ? 'Мои ученики и заявки' : 'My Students & Submissions'}
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          {dict.teacher.studentsRegistryDesc}
        </p>
      </div>

      <div className="flex items-center gap-4 bg-[#08080c] p-3 rounded-[10px] border border-[#2a2a32]">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#757580] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              locale === 'ru'
                ? 'Поиск по имени ученика или шифру...'
                : 'Search by student name or code...'
            }
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyText={dict.teacher.emptyStudentsTitle}
      />
    </div>
  );
}
