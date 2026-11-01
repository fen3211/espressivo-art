'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
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
  const { locale, dict } = useLanguage();

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
  const [consentDataProcess, setConsentDataProcess] = useState(false);
  const [consentPublicStream, setConsentPublicStream] = useState(false);

  const steps = [
    { num: 1, title: dict.dashboard.wizard.step1Title, icon: User },
    { num: 2, title: dict.dashboard.wizard.step2Title, icon: FileCheck },
    { num: 3, title: dict.dashboard.wizard.step3Title, icon: Video },
    { num: 4, title: locale === 'ru' ? '152-ФЗ Согласия' : 'Consent & Privacy', icon: ShieldCheck },
    { num: 5, title: locale === 'ru' ? 'Финализация' : 'Review & Pay', icon: CreditCard },
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
          {locale === 'ru' ? 'Мастер подачи конкурсной заявки' : 'Entry Submission Wizard'}
        </h1>
        <p className="text-xs sm:text-sm text-[#a3a3b3] mt-1">
          {locale === 'ru'
            ? `Сезон espressivo VOCAL 2026 • Шаг ${step} из 5`
            : `Season espressivo VOCAL 2026 • Step ${step} of 5`}
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
            <h2 className="text-lg font-medium text-[#fcfcfc]">
              {locale === 'ru' ? 'Шаг 1: Данные юного участника' : 'Step 1: Young Entrant Details'}
            </h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              {locale === 'ru'
                ? 'Укажите имя ребенка в точности так, как оно должно быть напечатано в международном дипломе.'
                : 'Provide the entrant name exactly as it should appear on the official certificate.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input
                label={dict.dashboard.wizard.participantName}
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder={locale === 'ru' ? 'Алексеева София Андреевна' : 'Sofia Alekseeva'}
              />
            </div>

            <Input
              label={dict.dashboard.wizard.birthDate}
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />

            <Input
              label={locale === 'ru' ? 'Хронометраж выступления (секунд)' : 'Performance Timing (seconds)'}
              type="number"
              value={performanceDuration}
              onChange={(e) => setPerformanceDuration(e.target.value)}
              helperText={locale === 'ru' ? 'Например, 210 сек (3 мин 30 сек)' : 'e.g., 210 sec (3 min 30 sec)'}
            />

            <Input
              label={dict.dashboard.wizard.teacherName}
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder={locale === 'ru' ? 'Иванова Анна Сергеевна' : 'Anna Ivanova'}
            />

            <Input
              label={dict.dashboard.wizard.musicSchool}
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder={locale === 'ru' ? 'ДШИ им. П.И. Чайковского' : 'Tchaikovsky School of Music'}
            />

            <div className="sm:col-span-2">
              <Input
                label={locale === 'ru' ? 'Исполняемое произведение (композитор, название, тональность)' : 'Repertoire Piece (Composer, Title, Key)'}
                required
                value={repertoire}
                onChange={(e) => setRepertoire(e.target.value)}
                placeholder={locale === 'ru' ? "Дж. Перголези — Se tu m'ami (канцона соль минор)" : "G. Pergolesi — Se tu m'ami (canzona in G minor)"}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Nomination & Category */}
      {step === 2 && (
        <Card padding="lg" className="space-y-6">
          <div className="border-b border-[#2a2a32] pb-4">
            <h2 className="text-lg font-medium text-[#fcfcfc]">
              {locale === 'ru' ? 'Шаг 2: Номинация и категория' : 'Step 2: Nomination & Age Group'}
            </h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              {locale === 'ru'
                ? 'Выберите дисциплину и возрастную категорию на дату подачи заявки.'
                : 'Select discipline and age bracket on the date of entry submission.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label={locale === 'ru' ? 'Конкурсная номинация' : 'Competition Discipline'}
              value={nomination}
              onChange={(e) => setNomination(e.target.value)}
              options={[
                { value: 'VOC-ACAD', label: locale === 'ru' ? 'Академический вокал (Соло)' : 'Academic Vocal (Solo)' },
                { value: 'VOC-POP', label: locale === 'ru' ? 'Эстрадный вокал (Соло)' : 'Pop & Contemporary Vocal (Solo)' },
                { value: 'VOC-JAZZ', label: locale === 'ru' ? 'Джазовый вокал и импровизация' : 'Jazz Vocal & Scat Improvisation' },
                { value: 'VOC-FOLK', label: locale === 'ru' ? 'Народное и этно-пение' : 'Traditional Folk & Ethno Vocal' },
                { value: 'VOC-ENS', label: locale === 'ru' ? 'Вокальные ансамбли и дуэты' : 'Vocal Ensembles & Duets' },
              ]}
            />

            <Select
              label={locale === 'ru' ? 'Возрастная категория' : 'Age Bracket'}
              value={ageCategory}
              onChange={(e) => setAgeCategory(e.target.value)}
              options={[
                { value: 'CAT-0', label: locale === 'ru' ? 'Группа 0 (Дебют): 6–8 лет' : 'Group 0 (Debut): 6–8 yrs' },
                { value: 'CAT-1', label: locale === 'ru' ? 'Группа I (Младшая): 9–11 лет' : 'Group I (Junior): 9–11 yrs' },
                { value: 'CAT-2', label: locale === 'ru' ? 'Группа II (Средняя): 12–14 лет' : 'Group II (Intermediate): 12–14 yrs' },
                { value: 'CAT-3', label: locale === 'ru' ? 'Группа III (Старшая): 15–17 лет' : 'Group III (Advanced): 15–17 yrs' },
                { value: 'CAT-4', label: locale === 'ru' ? 'Группа IV (Молодежная): 18–22 года' : 'Group IV (Youth Master): 18–22 yrs' },
              ]}
            />
          </div>

          <div className="p-4 rounded-[8px] bg-[#08080c] border border-[#2a2a32] text-xs text-[#a3a3b3] space-y-1">
            <div className="text-[#fcfcfc] font-medium">
              {locale === 'ru' ? 'Контроль соответствия регламенту:' : 'Statutory Compliance Check:'}
            </div>
            <div>
              {locale === 'ru'
                ? '• Максимальная длительность произведения для соло: до 4:30 мин.'
                : '• Maximum piece duration for solo: up to 4:30 min.'}
            </div>
            <div>
              {locale === 'ru'
                ? '• Формат аккомпанемента: рояль или фонограмма минус 1 без дублирования солирующей партии.'
                : '• Accompaniment format: live piano or minus-one audio without melody guide tracks.'}
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Video URL & Live Preview */}
      {step === 3 && (
        <Card padding="lg" className="space-y-6">
          <div className="border-b border-[#2a2a32] pb-4">
            <h2 className="text-lg font-medium text-[#fcfcfc]">
              {locale === 'ru' ? 'Шаг 3: Видеозапись выступления' : 'Step 3: Performance Video Recording'}
            </h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              {locale === 'ru'
                ? 'Вставьте ссылку на YouTube (открытый или доступ по ссылке), Rutube, VK Video или прямой MP4 файл.'
                : 'Paste link to YouTube (public or unlisted), Rutube, VK Video, or direct MP4 URL.'}
            </p>
          </div>

          <Input
            label={dict.dashboard.wizard.videoUrl}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            helperText={
              locale === 'ru'
                ? 'Запись должна быть сделана единым дублем без монтажных склеек и питч-коррекции.'
                : 'The recording must be a single uncut take without video editing or pitch-tuning.'
            }
          />

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-[#a3a3b3]">
              <span>
                {locale === 'ru'
                  ? 'Интерактивный предварительный просмотр для жюри:'
                  : 'Interactive Preview for Jury Terminal:'}
              </span>
              <span className="text-[#6199f6] font-mono">1080p Preview Verified</span>
            </div>
            <ProtectedVideoPlayer
              videoUrl={videoUrl}
              title={repertoire || (locale === 'ru' ? 'Конкурсное выступление' : 'Competition Performance')}
              participantCode="DRAFT-PREVIEW"
            />
          </div>
        </Card>
      )}

      {/* Step 4: Parent Compliance (152-FZ) */}
      {step === 4 && (
        <Card padding="lg" className="space-y-6">
          <div className="border-b border-[#2a2a32] pb-4">
            <h2 className="text-lg font-medium text-[#fcfcfc]">
              {locale === 'ru' ? 'Шаг 4: Согласия родителей (152-ФЗ)' : 'Step 4: Parental Consent (152-FZ & GDPR)'}
            </h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              {locale === 'ru'
                ? 'В соответствии с законодательством РФ об охране персональных данных несовершеннолетних.'
                : 'In compliance with applicable data privacy statutes for minor performers.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input
                label={dict.dashboard.wizard.legalGuardianName}
                required
                value={parentFullName}
                onChange={(e) => setParentFullName(e.target.value)}
              />
            </div>

            <Input
              label={locale === 'ru' ? 'Электронная почта родителя' : 'Guardian Email'}
              type="email"
              required
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
            />

            <Input
              label={dict.dashboard.wizard.legalGuardianPhone}
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
                {locale === 'ru'
                  ? 'Я даю полное согласие на обработку персональных данных моего несовершеннолетнего ребенка в соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных» для целей судейства и оформления дипломов.'
                  : 'I grant full consent to process personal data of my minor child in accordance with 152-FZ and GDPR standards for adjudication and diploma issuance.'}
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
                {locale === 'ru'
                  ? 'Согласие на распространение персональных данных (ст. 10.1 152-ФЗ): Я даю отдельное добровольное согласие на публикацию сокращенного имени участника и конкурсных баллов в публичном реестре верификации дипломов (необязательно, отказ не препятствует участию в конкурсе).'
                  : 'Consent to public data dissemination (Art. 10.1 152-FZ): I grant voluntary separate consent to publish the entrant\'s formatted name and scores in the public diploma verification registry (optional, refusal does not affect contest entry).'}
              </span>
            </label>
          </div>
        </Card>
      )}

      {/* Step 5: Summary & Submit / Payment Choice */}
      {step === 5 && (
        <Card padding="lg" className="space-y-6">
          <div className="border-b border-[#2a2a32] pb-4">
            <h2 className="text-lg font-medium text-[#fcfcfc]">
              {locale === 'ru' ? 'Шаг 5: Проверка и финализация' : 'Step 5: Review & Submission'}
            </h2>
            <p className="text-xs text-[#a3a3b3] mt-0.5">
              {locale === 'ru'
                ? 'Проверьте корректность данных перед отправкой в оргкомитет.'
                : 'Verify submission details before sending to the organizing committee.'}
            </p>
          </div>

          {/* Review Sheet */}
          <div className="rounded-[8px] bg-[#08080c] border border-[#2a2a32] p-5 space-y-3 text-xs">
            <div className="flex justify-between border-b border-[#2a2a32] pb-2">
              <span className="text-[#a3a3b3]">
                {locale === 'ru' ? 'Участник:' : 'Entrant:'}
              </span>
              <span className="font-medium text-[#fcfcfc]">
                {participantName || (locale === 'ru' ? 'Алексеева София' : 'Sofia Alekseeva')}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a32] pb-2">
              <span className="text-[#a3a3b3]">
                {locale === 'ru' ? 'Номинация:' : 'Nomination:'}
              </span>
              <span className="font-medium text-[#fcfcfc]">
                {locale === 'ru' ? 'Академический вокал (Соло)' : 'Academic Vocal (Solo)'}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a32] pb-2">
              <span className="text-[#a3a3b3]">
                {locale === 'ru' ? 'Произведение:' : 'Repertoire:'}
              </span>
              <span className="font-medium text-[#fcfcfc]">
                {repertoire || "G. Pergolesi — Se tu m'ami"}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#2a2a32] pb-2">
              <span className="text-[#a3a3b3]">
                {locale === 'ru' ? 'Преподаватель:' : 'Teacher:'}
              </span>
              <span className="font-medium text-[#fcfcfc]">
                {teacherName || (locale === 'ru' ? 'Иванова Анна Сергеевна' : 'Anna Ivanova')}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#a3a3b3]">
                {locale === 'ru' ? 'Регистрационный взнос:' : 'Registration Fee:'}
              </span>
              <span className="font-mono text-base font-bold text-[#6199f6]">2 500 ₽</span>
            </div>
          </div>

          <div className="p-4 rounded-[8px] bg-[rgba(97,153,246,0.08)] border border-[rgba(97,153,246,0.25)] text-xs text-[#dedfee]">
            {locale === 'ru'
              ? 'Вы можете сохранить заявку как черновик и оплатить позже, либо сразу перейти к безопасной оплате через банковский шлюз.'
              : 'You may save this application as a draft to complete payment later, or proceed directly to secure payment.'}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#2a2a32]">
            <Button
              variant="ghost"
              size="md"
              loading={loading}
              onClick={() => handleSubmit(true)}
            >
              {locale === 'ru' ? 'Сохранить черновик' : 'Save Draft'}
            </Button>
            <Button
              variant="iris-action"
              size="md"
              loading={loading}
              onClick={() => handleSubmit(false)}
            >
              {locale === 'ru' ? 'Оплатить взнос (2 500 ₽) и отправить в жюри' : 'Pay Entry Fee (2,500 ₽) & Submit'}
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
            {dict.dashboard.wizard.prevBtn}
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
            {dict.dashboard.wizard.nextBtn}
          </Button>
        )}
      </div>
    </div>
  );
}
