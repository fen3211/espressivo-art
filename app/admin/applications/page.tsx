'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Column } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { ProtectedVideoPlayer } from '@/components/video/ProtectedVideoPlayer';
import { Search, CheckCircle2, XCircle, Eye, ShieldCheck, UserCheck } from 'lucide-react';

interface ModRow extends Record<string, unknown> {
  id: string;
  code: string;
  participantName: string;
  nomination: string;
  category: string;
  videoUrl: string;
  status: string;
  paymentStatus: string;
  assignedJury: string;
}

export default function AdminApplicationsModerationPage() {
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<ModRow | null>(null);

  const applications: ModRow[] = [
    {
      id: 'app-001',
      code: 'EXP-2026-0042',
      participantName: 'Алексеева София (13 лет)',
      nomination: 'Академический вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'UNDER_REVIEW',
      paymentStatus: 'PAID',
      assignedJury: 'Проф. Вальтер Кауфманн',
    },
    {
      id: 'app-002',
      code: 'EXP-2026-0089',
      participantName: 'Алексеева София (13 лет)',
      nomination: 'Эстрадный вокал (Соло)',
      category: 'Группа II (12–14 лет)',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'EVALUATED',
      paymentStatus: 'PAID',
      assignedJury: 'Елена Беллелли',
    },
    {
      id: 'app-003',
      code: 'EXP-2026-0155',
      participantName: 'Екатерина Морозова (9 лет)',
      nomination: 'Джазовый вокал',
      category: 'Группа I (9–11 лет)',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'SUBMITTED',
      paymentStatus: 'PENDING',
      assignedJury: 'Не назначен',
    },
    {
      id: 'app-004',
      code: 'EXP-2026-0201',
      participantName: 'Артур Вартанян (16 лет)',
      nomination: 'Эстрадный вокал (Соло)',
      category: 'Группа III (15–17 лет)',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'UNDER_REVIEW',
      paymentStatus: 'PAID',
      assignedJury: 'Маркус Торнтон',
    },
  ];

  const filtered = applications.filter(
    (a) =>
      a.participantName.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<ModRow>[] = [
    {
      key: 'code',
      header: 'Шифр заявки',
      render: (r) => <span className="font-mono text-xs text-[#6199f6]">{r.code}</span>,
    },
    {
      key: 'participantName',
      header: 'Участник и категория',
      render: (r) => (
        <div>
          <div className="font-medium text-[#fcfcfc]">{r.participantName}</div>
          <div className="text-xs text-[#757580]">{r.category}</div>
        </div>
      ),
    },
    {
      key: 'nomination',
      header: 'Номинация',
      render: (r) => <span className="text-sm text-[#dedfee]">{r.nomination}</span>,
    },
    {
      key: 'status',
      header: 'Статус заявки',
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: 'assignedJury',
      header: 'Назначенный судья',
      render: (r) => (
        <span className={`text-xs font-mono ${r.assignedJury === 'Не назначен' ? 'text-amber-400' : 'text-[#dedfee]'}`}>
          {r.assignedJury}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Модерация',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<Eye className="w-3.5 h-3.5" />}
            onClick={() => setSelectedApp(r)}
          >
            Видео & Модерация
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          SUBMISSION MODERATION DESK
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          Модерация конкурсных заявок
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          Проверка видеоматериалов, назначение жюри и изменение статусов модерации
        </p>
      </div>

      <div className="flex items-center gap-4 bg-[#08080c] p-3 rounded-[10px] border border-[#2a2a32]">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#757580] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по шифру заявки или имени..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6]"
          />
        </div>
      </div>

      <Table columns={columns} data={filtered} />

      {/* Moderation Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Модерация заявки ${selectedApp.code}`}
          maxWidth="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="danger-outline"
                size="sm"
                iconLeft={<XCircle className="w-4 h-4" />}
                onClick={() => {
                  alert('Заявка отклонена');
                  setSelectedApp(null);
                }}
              >
                Отклонить заявку
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)}>
                  Закрыть
                </Button>
                <Button
                  variant="iris-action"
                  size="sm"
                  iconLeft={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => {
                    alert('Заявка одобрена и передана жюри');
                    setSelectedApp(null);
                  }}
                >
                  Одобрить и назначить в жюри
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <ProtectedVideoPlayer
              videoUrl={selectedApp.videoUrl}
              title={`Проверка модератором: ${selectedApp.participantName}`}
              participantCode={selectedApp.code}
            />

            <div className="p-4 rounded-[8px] bg-[#040407] border border-[#2a2a32] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#757580]">Участник:</span>
                <span className="text-[#fcfcfc] font-medium">{selectedApp.participantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#757580]">Номинация:</span>
                <span className="text-[#dedfee]">{selectedApp.nomination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#757580]">Текущий судья:</span>
                <span className="text-[#6199f6] font-mono">{selectedApp.assignedJury}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
