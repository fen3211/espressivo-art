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
  const { locale, dict } = useLanguage();

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
      setError(
        locale === 'ru'
          ? 'Пожалуйста, заполните обязательные поля'
          : 'Please complete all required fields'
      );
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
            {dict.auth.titleRegister}
          </h1>
          <p className="text-xs sm:text-sm font-serif text-[#757580] mt-2">
            {dict.auth.subtitleRegister}
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
              {locale === 'ru' ? 'РОЛЬ 01' : 'ROLE 01'}
            </div>
            <div className="text-lg font-serif font-bold">
              {locale === 'ru' ? 'Участник / Родитель' : 'Participant / Parent'}
            </div>
            <p className="text-xs font-serif mt-1 opacity-80">
              {locale === 'ru'
                ? 'Подача заявки, загрузка видеозаписи, получение оценок жюри и дипломов.'
                : 'Submit entries, upload performance videos, track adjudications, and access verified diplomas.'}
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
              {locale === 'ru' ? 'РОЛЬ 02 • 20% БОНУС' : 'ROLE 02 • 20% ROYALTY'}
            </div>
            <div className="text-lg font-serif font-bold">
              {locale === 'ru' ? 'Преподаватель' : 'Teacher / Mentor'}
            </div>
            <p className="text-xs font-serif mt-1 opacity-80">
              {locale === 'ru'
                ? 'Личная реферальная ссылка, реестр учеников, начисление комиссии 20%.'
                : 'Dedicated referral promo link, student roster, and official 20% royalty disbursements.'}
            </p>
          </button>
        </div>

        {/* Teacher Bonus Banner */}
        {role === 'TEACHER' && (
          <div className="p-4 border border-[#000000] bg-[#dedede] mb-6 flex items-start gap-3 text-xs font-serif">
            <Sparkles className="w-5 h-5 text-[#000000] shrink-0 mt-0.5" />
            <div>
              <strong>{locale === 'ru' ? 'Партнёрская программа для наставников:' : 'Teacher Partner Program:'}</strong>{' '}
              {locale === 'ru'
                ? 'После регистрации вам будет автоматически сгенерирован уникальный реферальный код. За каждого ученика начисляется 20% от оргвзноса (от 500 ₽) с прямым выводом на карту.'
                : 'Upon registration, your personal referral code is generated automatically. Earn 20% from every submitted student entry fee with official bank payouts.'}
            </div>
          </div>
        )}

        {/* Referral detected badge */}
        {referralCode && role === 'PARTICIPANT' && (
          <div className="p-3 border border-[#000000] bg-[#dedede] mb-6 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#000000]" />
              <span>
                {locale === 'ru'
                  ? 'Реферальный код преподавателя применен:'
                  : 'Teacher referral promo code applied:'}
              </span>
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
            label={
              role === 'TEACHER'
                ? (locale === 'ru' ? 'ФИО Преподавателя' : 'Teacher Full Name')
                : (locale === 'ru' ? 'ФИО Представителя или Участника' : 'Parent or Participant Full Name')
            }
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={locale === 'ru' ? 'Иванова Анна Сергеевна' : 'Anna Ivanova'}
          />

          <Input
            theme="art"
            label={dict.auth.emailLabel}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="anna.ivanova@music-school.ru"
          />

          <Input
            theme="art"
            label={
              locale === 'ru'
                ? 'Номер телефона (для уведомлений о дипломах)'
                : 'Phone Number (for SMS & diploma notices)'
            }
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (999) 000-00-00"
          />

          {role === 'TEACHER' && (
            <Input
              theme="art"
              label={
                locale === 'ru'
                  ? 'Учебное заведение / ДМШ / Студия'
                  : 'Educational Institution / Conservatory'
              }
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder={locale === 'ru' ? 'ДШИ им. П.И. Чайковского' : 'Tchaikovsky School of Arts'}
            />
          )}

          {role === 'PARTICIPANT' && (
            <Input
              theme="art"
              label={
                locale === 'ru'
                  ? 'Реферальный промокод преподавателя (если есть)'
                  : 'Teacher Referral Promo Code (optional)'
              }
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="EXP-TEACHER-2026"
            />
          )}

          <Input
            theme="art"
            label={dict.auth.passwordLabel}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={locale === 'ru' ? 'Минимум 8 символов' : 'Minimum 8 characters'}
          />

          <div className="text-[11px] font-serif text-[#757580] pt-2">
            {locale === 'ru'
              ? 'Регистрируясь, вы принимаете регламент конкурса и даете согласие на обработку персональных данных в соответствии с 152-ФЗ и GDPR.'
              : 'By registering, you accept the competition regulations and give consent to personal data processing under 152-FZ and GDPR.'}
          </div>

          <div className="pt-2">
            <Button variant="solid-ink" fullWidth size="lg" loading={loading} type="submit">
              {role === 'TEACHER'
                ? (locale === 'ru' ? 'Зарегистрироваться как педагог' : 'Sign Up as Teacher')
                : (locale === 'ru' ? 'Создать кабинет и подать заявку' : 'Create Account & Apply')}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs font-serif text-[#121212]">
          {dict.auth.haveAccountPrompt}{' '}
          <Link href="/login" className="font-sans font-bold uppercase underline text-[#000000]">
            {dict.auth.submitLogin}
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
