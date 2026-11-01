'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Users, Search, ShieldCheck } from 'lucide-react';

interface UserRow extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  role: string;
  roleLabel: string;
  status: string;
  extraInfo: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const users: UserRow[] = [
    {
      id: '1',
      fullName: 'Алексеева Елена Викторовна',
      email: 'elena.singer@example.com',
      role: 'PARTICIPANT',
      roleLabel: 'Участник / Родитель',
      status: 'ACTIVE',
      extraInfo: '2 заявки в сезоне',
      createdAt: '12.05.2026',
    },
    {
      id: '2',
      fullName: 'Иванова Анна Сергеевна',
      email: 'anna.ivanova@music-school.ru',
      role: 'TEACHER',
      roleLabel: 'Преподаватель (20%)',
      status: 'ACTIVE',
      extraInfo: 'Код: IVANOVA-VOCAL • 14 учеников',
      createdAt: '10.04.2026',
    },
    {
      id: '3',
      fullName: 'Проф. Вальтер Кауфманн',
      email: 'w.kaufmann@vienna-opera.at',
      role: 'JURY',
      roleLabel: 'Председатель жюри',
      status: 'ACTIVE',
      extraInfo: 'Венская государственная опера',
      createdAt: '01.03.2026',
    },
    {
      id: '4',
      fullName: 'Елена Беллелли',
      email: 'e.bellelli@conservatoriomilano.it',
      role: 'JURY',
      roleLabel: 'Член жюри',
      status: 'ACTIVE',
      extraInfo: 'Консерватория Милана',
      createdAt: '05.03.2026',
    },
    {
      id: '5',
      fullName: 'Главный Администратор',
      email: 'admin@espressivo-art.com',
      role: 'ADMIN',
      roleLabel: 'Супер-администратор',
      status: 'ACTIVE',
      extraInfo: 'Полный доступ (Root)',
      createdAt: '01.01.2026',
    },
  ];

  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (search && !u.fullName.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const columns: Column<UserRow>[] = [
    {
      key: 'fullName',
      header: 'Пользователь',
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">{r.fullName}</div>
          <div className="text-xs text-[#757580]">{r.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Роль в системе',
      render: (r) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
            r.role === 'ADMIN'
              ? 'bg-red-950/40 text-red-400 border border-red-800/40'
              : r.role === 'JURY'
              ? 'bg-purple-950/40 text-purple-300 border border-purple-800/40'
              : r.role === 'TEACHER'
              ? 'bg-[rgba(97,153,246,0.15)] text-[#6199f6] border border-[#6199f6]/30'
              : 'bg-[#181826] text-[#a3a3b3] border border-[#2a2a32]'
          }`}
        >
          {r.roleLabel}
        </span>
      ),
    },
    {
      key: 'extraInfo',
      header: 'Детали профиля',
      render: (r) => <span className="text-xs text-[#dedfee]">{r.extraInfo}</span>,
    },
    {
      key: 'status',
      header: 'Статус аккаунта',
      render: () => <Badge status="COMPLETED" label="Активен" />,
    },
    {
      key: 'createdAt',
      header: 'Дата регистрации',
      render: (r) => <span className="text-xs text-[#757580]">{r.createdAt}</span>,
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          USER ADMINISTRATION
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          Пользователи и роли платформы
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          Управление правами доступа участников, преподавателей, жюри и администраторов
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#08080c] p-3 rounded-[10px] border border-[#2a2a32]">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Все пользователи' },
            { id: 'PARTICIPANT', label: 'Участники' },
            { id: 'TEACHER', label: 'Преподаватели' },
            { id: 'JURY', label: 'Жюри' },
            { id: 'ADMIN', label: 'Администрация' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-[#6199f6] text-[#0a0a13] font-bold'
                  : 'text-[#a3a3b3] hover:text-[#fcfcfc] hover:bg-[#181826]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#757580] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} />
    </div>
  );
}
