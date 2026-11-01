'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();

  const [role, setRole] = useState<'PARTICIPANT' | 'TEACHER'>('PARTICIPANT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract ?ref= from URL
  useEffect(() => {
    const refParam = searchParams.get('ref') || searchParams.get('referralCode');
    if (refParam) {
      setReferralCode(refParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Пожалуйста, заполните обязательные поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone,
          role,
          organization: role === 'TEACHER' ? organization : undefined,
          referralCode: referralCode || undefined,
        }),
      });

      if (res.ok) {
        if (role === 'TEACHER') {
          router.push('/teacher');
        } else {
          router.push('/dashboard/applications/new');
        }
        return;
      }
    } catch {
      // Fallback if API route is not running
    }

    setTimeout(() => {
      setLoading(false);
      if (role === 'TEACHER') {
        router.push('/teacher');
      } else {
        router.push('/dashboard/applications/new');
      }
    }, 450);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="border-b border-[#000000] pb-6 mb-8 text-center">
          <span className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212] block mb-2">
            REGISTRATION MONOGRAPH
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#000000]">
            {locale === 'ru' ? 'Регистрация в системе' : 'Create an Account'}
          </h1>
          <p className="text-xs sm:text-sm font-serif text-[#757580] mt-2">
            {locale === 'ru'
              ? 'Выберите статус учетной записи для перехода в соответствующий кабинет'
              : 'Select your account role to configure your dedicated workspace'}
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            type="button"
            onClick={() => setRole('PARTICIPANT')}
            className={`p-4 border text-left cursor-pointer transition-colors ${
              role === 'PARTICIPANT'
                ? 'border-[#000000] bg-[#000000] text-white'
                : 'border-[#000000] bg-[#e7e7e7] text-black hover:bg-[#dedede]'
            }`}
          >
            <div className="text-[9px] uppercase font-mono font-bold tracking-widest opacity-70 mb-1">
              РОЛЬ 01
            </div>
            <div className="text-lg font-serif font-bold">Участник / Родитель</div>
            <p className="text-xs font-serif mt-1 opacity-80">
              Подача заявки, загрузка видеозаписи, получение оценок жюри и дипломов.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRole('TEACHER')}
            className={`p-4 border text-left cursor-pointer transition-colors ${
              role === 'TEACHER'
                ? 'border-[#000000] bg-[#000000] text-white'
                : 'border-[#000000] bg-[#e7e7e7] text-black hover:bg-[#dedede]'
            }`}
          >
            <div className="text-[9px] uppercase font-mono font-bold tracking-widest opacity-70 mb-1">
              РОЛЬ 02 • 20% БОНУС
            </div>
            <div className="text-lg font-serif font-bold">Преподаватель</div>
            <p className="text-xs font-serif mt-1 opacity-80">
              Личная реферальная ссылка, реестр учеников, начисление комиссии 20%.
            </p>
          </button>
        </div>

        {/* Teacher Bonus Banner */}
        {role === 'TEACHER' && (
          <div className="p-4 border border-[#000000] bg-[#dedede] mb-6 flex items-start gap-3 text-xs font-serif">
            <Sparkles className="w-5 h-5 text-[#000000] shrink-0 mt-0.5" />
            <div>
              <strong>Партнёрская программа для наставников:</strong> После регистрации вам будет автоматически сгенерирован уникальный реферальный код. За каждого ученика начисляется 20% от оргвзноса (от 500 ₽) с прямым выводом на карту.
            </div>
          </div>
        )}

        {/* Referral detected badge */}
        {referralCode && role === 'PARTICIPANT' && (
          <div className="p-3 border border-[#000000] bg-[#dedede] mb-6 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#000000]" />
              <span>Реферальный код преподавателя применен:</span>
            </div>
            <span className="font-mono font-bold text-sm bg-black text-white px-2 py-0.5">
              {referralCode}
            </span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 border border-red-600 bg-red-100 text-xs text-red-900 font-sans">
              {error}
            </div>
          )}

          <Input
            theme="art"
            label={role === 'TEACHER' ? 'ФИО Преподавателя' : 'ФИО Представителя или Участника'}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Иванова Анна Сергеевна"
          />

          <Input
            theme="art"
            label="Email адрес для связи"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="anna.ivanova@music-school.ru"
          />

          <Input
            theme="art"
            label="Номер телефона (для SMS-уведомлений о дипломах)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (999) 000-00-00"
          />

          {role === 'TEACHER' && (
            <Input
              theme="art"
              label="Учебное заведение / ДМШ / Студия"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="ДШИ им. П.И. Чайковского"
            />
          )}

          {role === 'PARTICIPANT' && (
            <Input
              theme="art"
              label="Реферальный промокод преподавателя (если есть)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="EXP-TEACHER-2026"
            />
          )}

          <Input
            theme="art"
            label="Придумайте пароль"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Минимум 8 символов"
          />

          <div className="text-[11px] font-serif text-[#757580] pt-2">
            Регистрируясь, вы принимаете регламент конкурса и даете согласие на обработку персональных данных в соответствии с 152-ФЗ.
          </div>

          <div className="pt-2">
            <Button variant="solid-ink" fullWidth size="lg" loading={loading} type="submit">
              {role === 'TEACHER' ? 'Зарегистрироваться как педагог' : 'Создать кабинет и подать заявку'}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs font-serif text-[#121212]">
          Уже есть учетная запись?{' '}
          <Link href="/login" className="font-sans font-bold uppercase underline text-[#000000]">
            Войти в кабинет
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-serif">Загрузка формы регистрации...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
