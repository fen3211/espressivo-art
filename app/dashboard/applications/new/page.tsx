'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ProtectedVideoPlayer } from '@/components/video/ProtectedVideoPlayer';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Video,
  User,
  ShieldCheck,
  CreditCard,
  FileCheck,
} from 'lucide-react';

export default function NewApplicationPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [participantName, setParticipantName] = useState('');
  const [birthDate, setBirthDate] = useState('2012-04-15');
  const [teacherName, setTeacherName] = useState('Иванова Анна Сергеевна');
  const [institution, setInstitution] = useState('ДШИ им. П.И. Чайковского');
  const [repertoire, setRepertoire] = useState('');
  const [performanceDuration, setPerformanceDuration] = useState('210'); // seconds

  const [nomination, setNomination] = useState('VOC-ACAD');
  const [ageCategory, setAgeCategory] = useState('CAT-2');

  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  const [parentFullName, setParentFullName] = useState('Алексеева Елена Викторовна');
  const [parentEmail, setParentEmail] = useState('elena.singer@example.com');
  const [parentPhone, setParentPhone] = useState('+7 (999) 123-45-67');
  const [consentDataProcess, setConsentDataProcess] = useState(true);
  const [consentPublicStream, setConsentPublicStream] = useState(true);

  const steps = [
    { num: 1, title: 'Участник', icon: User },
    { num: 2, title: 'Номинация', icon: FileCheck },
    { num: 3, title: 'Видеоматериал', icon: Video },
    { num: 4, title: '152-ФЗ Согласия', icon: ShieldCheck },
    { num: 5, title: 'Финализация', icon: CreditCard },
  ];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);

    try {
      await fetch('/api/participant/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName,
          birthDate,
          teacherName,
          institution,
          repertoire,
          performanceDuration: parseInt(performanceDuration, 10),
          nominationId: nomination,
          ageCategoryId: ageCategory,
          videoUrl,
          parentFullName,
          parentEmail,
          parentPhone,
          consentDataProcess,
          consentPublicStream,
          isDraft,
        }),
      });
    } catch {
      // Mock submit
    }

    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard/applications');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-[#2a2a32] pb-6">
        <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
          <Link href="/dashboard/applications" className="hover:underline">
            APPLICATIONS
          </Link>
          <span>/</span>
          <span>NEW SUBMISSION WIZARD</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-medium text-[#fcfcfc]">
          Мастер подачи конкурсной заявки
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          Сезон espressivo VOCAL 2026 • Шаг {step} из 5
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-5 gap-2 pb-4">
        {steps.map((s) => {
          const Icon = s.icon;
          const isDone = s.num < step;
          const isCurrent = s.num === step;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`flex flex-col items-center p-3 rounded-[8px] border text-center transition-all cursor-pointer ${
                isCurrent
                  ? 'border-[#6199f6] bg-[#181826] shadow-[0_0_12px_rgba(97,153,246,0.2)]'
                  : isDone
                  ? 'border-[#2a2a32] bg-[#08080c] text-[#22c55e]'
                  : 'border-[#2a2a32] bg-[#040407] text-[#757580] opacity-60'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                ) : (
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#6199f6]' : 'text-[#757580]'}`} />
                )}
                <span className="text-[10px] font-mono font-bold">0{s.num}</span>
              </div>
              <span className={`text-xs truncate hidden sm:block ${isCurrent ? 'text-[#fcfcfc] font-medium' : ''}`}>
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step 1: Participant Info */}
      {step === 1 && (
        <Card padding="lg" className="space-y-6">
          <div className="border-b border-[#2a2a32] pb-4">
            <h2 className="text-lg font-medium text-[#fcfcfc]">Шаг 1: Данные юного участника</h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              Укажите имя ребенка в точности так, как оно должно быть напечатано в международном дипломе.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input
                label="ФИО Участника (полностью)"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Алексеева София Андреевна"
              />
            </div>

            <Input
              label="Дата рождения"
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />

            <Input
              label="Хронометраж выступления (секунд)"
              type="number"
              value={performanceDuration}
              onChange={(e) => setPerformanceDuration(e.target.value)}
              helperText="Например, 210 сек (3 мин 30 сек)"
            />

            <Input
              label="ФИО Педагога / Наставника"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Иванова Анна Сергеевна"
            />

            <Input
              label="Учебное заведение / ДМШ / Студия"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="ДШИ им. П.И. Чайковского"
            />

            <div className="sm:col-span-2">
              <Input
                label="Исполняемое произведение (композитор, название, тональность)"
                required
                value={repertoire}
                onChange={(e) => setRepertoire(e.target.value)}
                placeholder="Дж. Перголези — Se tu m'ami (канцона соль минор)"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Nomination & Category */}
      {step === 2 && (
        <Card padding="lg" className="space-y-6">
          <div className="border-b border-[#2a2a32] pb-4">
            <h2 className="text-lg font-medium text-[#fcfcfc]">Шаг 2: Номинация и категория</h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              Выберите дисциплину и возрастную категорию на дату подачи заявки.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Конкурсная номинация"
              value={nomination}
              onChange={(e) => setNomination(e.target.value)}
              options={[
                { value: 'VOC-ACAD', label: 'Академический вокал (Соло)' },
                { value: 'VOC-POP', label: 'Эстрадный вокал (Соло)' },
                { value: 'VOC-JAZZ', label: 'Джазовый вокал и импровизация' },
                { value: 'VOC-FOLK', label: 'Народное и этно-пение' },
                { value: 'VOC-ENS', label: 'Вокальные ансамбли и дуэты' },
              ]}
            />

            <Select
              label="Возрастная категория"
              value={ageCategory}
              onChange={(e) => setAgeCategory(e.target.value)}
              options={[
                { value: 'CAT-0', label: 'Группа 0 (Дебют): 6–8 лет' },
                { value: 'CAT-1', label: 'Группа I (Младшая): 9–11 лет' },
                { value: 'CAT-2', label: 'Группа II (Средняя): 12–14 лет' },
                { value: 'CAT-3', label: 'Группа III (Старшая): 15–17 лет' },
                { value: 'CAT-4', label: 'Группа IV (Молодежная): 18–22 года' },
              ]}
            />
          </div>

          <div className="p-4 rounded-[8px] bg-[#08080c] border border-[#2a2a32] text-xs text-[#a3a3b3] space-y-1">
            <div className="text-[#fcfcfc] font-medium">Контроль соответствия регламенту:</div>
            <div>• Максимальная длительность произведения для соло: до 4:30 мин.</div>
            <div>• Формат аккомпанемента: рояль или фонограмма минус 1 без дублирования солирующей партии.</div>
          </div>
        </Card>
      )}

      {/* Step 3: Video URL & Live Preview */}
      {step === 3 && (
        <Card padding="lg" className="space-y-6">
          <div className="border-b border-[#2a2a32] pb-4">
            <h2 className="text-lg font-medium text-[#fcfcfc]">Шаг 3: Видеозапись выступления</h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              Вставьте ссылку на YouTube (открытый или доступ по ссылке), Rutube, VK Video или прямой MP4 файл.
            </p>
          </div>

          <Input
            label="Ссылка на видеозапись"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            helperText="Запись должна быть сделана единым дублем без монтажных склеек и питч-коррекции."
          />

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-[#a3a3b3]">
              <span>Интерактивный предварительный просмотр для жюри:</span>
              <span className="text-[#6199f6] font-mono">1080p Preview Verified</span>
            </div>
            <ProtectedVideoPlayer
              videoUrl={videoUrl}
              title={repertoire || 'Конкурсное выступление'}
              participantCode="DRAFT-PREVIEW"
            />
          </div>
        </Card>
      )}

      {/* Step 4: Parent Compliance (152-FZ) */}
      {step === 4 && (
        <Card padding="lg" className="space-y-6">
          <div className="border-b border-[#2a2a32] pb-4">
            <h2 className="text-lg font-medium text-[#fcfcfc]">Шаг 4: Согласия родителей (152-ФЗ)</h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              В соответствии с законодательством РФ об охране персональных данных несовершеннолетних.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input
                label="ФИО Родителя или законного представителя"
                required
                value={parentFullName}
                onChange={(e) => setParentFullName(e.target.value)}
              />
            </div>

            <Input
              label="Электронная почта родителя"
              type="email"
              required
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
            />

            <Input
              label="Контактный телефон родителя"
              type="tel"
              required
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
            />
          </div>

          <div className="space-y-3 pt-2 text-xs text-[#dedfee]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentDataProcess}
                onChange={(e) => setConsentDataProcess(e.target.checked)}
                className="mt-1 rounded border-[#2a2a32] text-[#6199f6] focus:ring-0"
              />
              <span>
                Я даю полное согласие на обработку персональных данных моего несовершеннолетнего ребенка в соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных» для целей судейства и оформления дипломов.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentPublicStream}
                onChange={(e) => setConsentPublicStream(e.target.checked)}
                className="mt-1 rounded border-[#2a2a32] text-[#6199f6] focus:ring-0"
              />
              <span>
                Я подтверждаю, что представленная видеозапись сделана вживую без наложения искусственного тюнинга голоса и разрешаю её воспроизведение членам международного жюри.
              </span>
            </label>
          </div>
        </Card>
      )}

      {/* Step 5: Summary & Submit / Payment Choice */}
      {step === 5 && (
        <Card padding="lg" className="space-y-6">
          <div className="border-b border-[#2a2a32] pb-4">
            <h2 className="text-lg font-medium text-[#fcfcfc]">Шаг 5: Проверка и финализация</h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              Проверьте корректность данных перед отправкой в оргкомитет.
            </p>
          </div>

          {/* Review Sheet */}
          <div className="rounded-[8px] bg-[#08080c] border border-[#2a2a32] p-5 space-y-3 text-xs">
            <div className="flex justify-between border-b border-[#2a2a32] pb-2">
              <span className="text-[#a3a3b3]">Участник:</span>
              <span className="font-medium text-[#fcfcfc]">{participantName || 'Алексеева София'}</span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a32] pb-2">
              <span className="text-[#a3a3b3]">Номинация:</span>
              <span className="font-medium text-[#fcfcfc]">Академический вокал (Соло)</span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a32] pb-2">
              <span className="text-[#a3a3b3]">Произведение:</span>
              <span className="font-medium text-[#fcfcfc]">{repertoire || 'Дж. Перголези — Se tu m\'ami'}</span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a32] pb-2">
              <span className="text-[#a3a3b3]">Преподаватель:</span>
              <span className="font-medium text-[#fcfcfc]">{teacherName || 'Иванова Анна Сергеевна'}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#a3a3b3]">Регистрационный взнос:</span>
              <span className="font-mono text-base font-bold text-[#6199f6]">2 500 ₽</span>
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-[rgba(97,153,246,0.08)] border border-[rgba(97,153,246,0.25)] text-xs text-[#dedfee]">
            Вы можете сохранить заявку как черновик и оплатить позже, либо сразу перейти к безопасной оплате через банковский шлюз.
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#2a2a32]">
            <Button
              variant="ghost"
              size="md"
              loading={loading}
              onClick={() => handleSubmit(true)}
            >
              Сохранить черновик
            </Button>
            <Button
              variant="iris-action"
              size="md"
              loading={loading}
              onClick={() => handleSubmit(false)}
            >
              Оплатить взнос (2 500 ₽) и отправить в жюри
            </Button>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        {step > 1 ? (
          <Button
            variant="ghost"
            size="md"
            iconLeft={<ChevronLeft className="w-4 h-4" />}
            onClick={handleBack}
          >
            Назад
          </Button>
        ) : (
          <div />
        )}

        {step < 5 && (
          <Button
            variant="primary-vellum"
            size="md"
            iconRight={<ChevronRight className="w-4 h-4" />}
            onClick={handleNext}
          >
            Продолжить
          </Button>
        )}
      </div>
    </div>
  );
}
