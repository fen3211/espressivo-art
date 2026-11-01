'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { locale, t, dict } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PARTICIPANT' | 'TEACHER' | 'JURY' | 'ADMIN'>('PARTICIPANT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(
        locale === 'ru'
          ? 'Пожалуйста, заполните email и пароль'
          : 'Please provide both email and password'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          data.error ||
            (locale === 'ru'
              ? 'Неверный логин или пароль'
              : 'Invalid email or password')
        );
        setLoading(false);
        return;
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
        return;
      }
      router.push('/dashboard');
    } catch {
      setError(
        dict.errors.networkError ||
          (locale === 'ru'
            ? 'Ошибка сети. Проверьте соединение с сервером.'
            : 'Network error. Please check your connection.')
      );
      setLoading(false);
    }
  };

  const quickDemoLogin = async (targetRole: 'PARTICIPANT' | 'TEACHER' | 'JURY' | 'ADMIN') => {
    setLoading(true);
    setError('');
    const creds: Record<string, { email: string; pass: string }> = {
      PARTICIPANT: { email: 'participant@espressivo.art', pass: 'pass1234' },
      TEACHER: { email: 'teacher@espressivo.art', pass: 'pass1234' },
      JURY: { email: 'jury@espressivo.art', pass: 'pass1234' },
      ADMIN: { email: 'admin@espressivo.art', pass: 'pass1234' },
    };
    const c = creds[targetRole];
    setEmail(c.email);
    setPassword(c.pass);
    setRole(targetRole);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: c.email, password: c.pass }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Ошибка демо-входа');
        setLoading(false);
        return;
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Ошибка сети при попытке демо-входа');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16 sm:py-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="border-b border-[#000000] pb-6 mb-8 text-center">
          <span className="text-[10px] uppercase font-sans font-bold tracking-[0.038em] text-[#121212] block mb-2">
            SECURE ACCESS PORTAL
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#000000]">
            {locale === 'ru' ? 'Вход в личный кабинет' : 'Sign In to Workspace'}
          </h1>
          <p className="text-xs sm:text-sm font-serif text-[#757580] mt-2">
            {locale === 'ru'
              ? 'Выберите вашу роль и введите учетные данные'
              : 'Select your role and enter credentials to proceed'}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-4 gap-1 border border-[#000000] p-1 bg-[#dedede] mb-6 font-sans text-[10px] uppercase font-bold tracking-wider">
          <button
            type="button"
            onClick={() => setRole('PARTICIPANT')}
            className={`py-2 text-center transition-colors cursor-pointer ${
              role === 'PARTICIPANT' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#121212] hover:bg-[#e7e7e7]'
            }`}
          >
            {dict.common.participant}
          </button>
          <button
            type="button"
            onClick={() => setRole('TEACHER')}
            className={`py-2 text-center transition-colors cursor-pointer ${
              role === 'TEACHER' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#121212] hover:bg-[#e7e7e7]'
            }`}
          >
            {dict.common.teacher}
          </button>
          <button
            type="button"
            onClick={() => setRole('JURY')}
            className={`py-2 text-center transition-colors cursor-pointer ${
              role === 'JURY' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#121212] hover:bg-[#e7e7e7]'
            }`}
          >
            {dict.common.jury}
          </button>
          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            className={`py-2 text-center transition-colors cursor-pointer ${
              role === 'ADMIN' ? 'bg-[#000000] text-[#ffffff]' : 'text-[#121212] hover:bg-[#e7e7e7]'
            }`}
          >
            {dict.common.admin}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 border border-red-600 bg-red-100 text-xs text-red-900 font-sans">
              {error}
            </div>
          )}

          <Input
            theme="art"
            label={dict.auth.emailLabel}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="elena.singer@example.com"
          />

          <Input
            theme="art"
            label={dict.auth.passwordLabel}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
          />

          <div className="pt-2">
            <Button variant="solid-ink" fullWidth size="lg" loading={loading} type="submit">
              {locale === 'ru' ? 'Войти в кабинет' : 'Enter Workspace'}
            </Button>
          </div>
        </form>

        {/* Quick Demo Access Buttons for instant QA / evaluation */}
        <div className="mt-10 pt-8 border-t border-[#000000]/20">
          <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#757580] mb-3 text-center">
            {locale === 'ru' ? 'ДЕМО-ДОСТУП В 1 КЛИК ДЛЯ ПРОВЕРКИ' : '1-CLICK DEMO ACCESS FOR QA'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline-ink"
              size="sm"
              onClick={() => quickDemoLogin('PARTICIPANT')}
            >
              {dict.common.participant} →
            </Button>
            <Button
              variant="outline-ink"
              size="sm"
              onClick={() => quickDemoLogin('TEACHER')}
            >
              {dict.common.teacher} (20%) →
            </Button>
            <Button
              variant="outline-ink"
              size="sm"
              onClick={() => quickDemoLogin('JURY')}
            >
              {dict.common.jury} →
            </Button>
            <Button
              variant="outline-ink"
              size="sm"
              onClick={() => quickDemoLogin('ADMIN')}
            >
              {dict.common.admin} →
            </Button>
          </div>
        </div>

        {/* Registration link */}
        <div className="mt-8 text-center text-xs font-serif text-[#121212]">
          {locale === 'ru' ? 'Ещё нет учетной записи? ' : "Don't have an account yet? "}
          <Link href="/register" className="font-sans font-bold uppercase underline text-[#000000]">
            {dict.common.register}
          </Link>
        </div>
      </div>
    </div>
  );
}
