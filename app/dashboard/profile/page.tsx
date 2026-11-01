'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Shield, Check } from 'lucide-react';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('Алексеева Елена Викторовна');
  const [email, setEmail] = useState('elena.singer@example.com');
  const [phone, setPhone] = useState('+7 (999) 123-45-67');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans">
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          ACCOUNT SETTINGS
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          Профиль пользователя
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          Контактные данные для связи и отправки электронных дипломов
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card padding="lg" className="space-y-5">
          <h2 className="text-base font-medium text-[#fcfcfc] border-b border-[#2a2a32] pb-3">
            Персональные данные
          </h2>

          <Input
            label="ФИО Родителя / Представителя"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Электронная почта"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Номер телефона"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="iris-action" size="md" type="submit">
              {saved ? 'Изменения сохранены' : 'Сохранить изменения'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
