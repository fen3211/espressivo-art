'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Download, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function RulesPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'espressivo-vocal-young-talents';
  const { locale } = useLanguage();

  const awardScale = [
    { degreeRu: 'Гран-при (Grand Prix)', degreeEn: 'Grand Prix', scoreRu: '100 баллов (единогласно)', scoreEn: '100 points (unanimous)', color: 'text-black font-bold' },
    { degreeRu: 'Лауреат I степени', degreeEn: 'Laureate 1st Degree', scoreRu: '95–99 баллов', scoreEn: '95–99 points', color: 'text-black' },
    { degreeRu: 'Лауреат II степени', degreeEn: 'Laureate 2nd Degree', scoreRu: '90–94 балла', scoreEn: '90–94 points', color: 'text-black' },
    { degreeRu: 'Лауреат III степени', degreeEn: 'Laureate 3rd Degree', scoreRu: '85–89 баллов', scoreEn: '85–89 points', color: 'text-black' },
    { degreeRu: 'Дипломант', degreeEn: 'Diplomant', scoreRu: '80–84 балла', scoreEn: '80–84 points', color: 'text-black' },
    { degreeRu: 'Грамота за участие', degreeEn: 'Certificate of Participation', scoreRu: 'менее 80 баллов', scoreEn: 'under 80 points', color: 'text-[#757580]' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16">
      {/* Header */}
      <div className="border-b border-[#000000] pb-6 mb-12">
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase font-bold tracking-widest text-[#757580] mb-3">
          <Link href="/competitions" className="hover:underline">
            COMPETITIONS
          </Link>
          <span>/</span>
          <Link href={`/competitions/${slug}`} className="hover:underline">
            {slug.toUpperCase()}
          </Link>
          <span>/</span>
          <span className="text-[#000000]">REGULATIONS & RULES</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif text-[#000000] tracking-tight">
          {locale === 'ru' ? 'Регламент и правила судейства' : 'Official Regulations & Scoring Rules'}
        </h1>
        <p className="text-base sm:text-lg font-serif text-[#121212] mt-4 max-w-3xl">
          {locale === 'ru'
            ? 'Официальный регламент сезона 2026. Технические требования к видеозаписи, 100-балльная шкала оценок и порядок распределения лауреатских званий.'
            : 'Official competition statutes for season 2026. Video capture requirements, 100-point rubric, and award distribution.'}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            variant="solid-ink"
            size="md"
            iconLeft={<Download className="w-4 h-4" />}
            onClick={() => alert('Скачивание официального положения (PDF)')}
          >
            {locale === 'ru' ? 'Скачать положение конкурса (PDF)' : 'Download Official Statutes (PDF)'}
          </Button>
          <Link href="/register">
            <Button variant="outline-ink" size="md">
              {locale === 'ru' ? 'Перейти к подаче заявки' : 'Submit Entry'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        {/* Sticky Index (Left) */}
        <div className="lg:col-span-4">
          <div className="border border-[#000000] p-6 bg-[#dedede] sticky top-20">
            <span className="text-[10px] uppercase font-sans font-bold tracking-widest text-[#121212] block mb-4">
              {locale === 'ru' ? 'РАЗДЕЛЫ РЕГЛАМЕНТА' : 'INDEX OF STATUTES'}
            </span>
            <ul className="space-y-3 font-sans text-xs">
              <li>
                <a href="#video-specs" className="hover:underline flex items-center gap-2">
                  <span className="font-mono text-[#757580]">01.</span>
                  <span>{locale === 'ru' ? 'Требования к видеозаписи' : 'Video Recording Requirements'}</span>
                </a>
              </li>
              <li>
                <a href="#scoring-rubric" className="hover:underline flex items-center gap-2">
                  <span className="font-mono text-[#757580]">02.</span>
                  <span>{locale === 'ru' ? '100-балльная шкала жюри' : '100-Point Adjudication Rubric'}</span>
                </a>
              </li>
              <li>
                <a href="#awards-scale" className="hover:underline flex items-center gap-2">
                  <span className="font-mono text-[#757580]">03.</span>
                  <span>{locale === 'ru' ? 'Присуждение степеней' : 'Award Tier Distribution'}</span>
                </a>
              </li>
              <li>
                <a href="#teacher-program" className="hover:underline flex items-center gap-2">
                  <span className="font-mono text-[#757580]">04.</span>
                  <span>{locale === 'ru' ? 'Партнёрская программа 20%' : 'Teacher Royalty Program (20%)'}</span>
                </a>
              </li>
              <li>
                <a href="#compliance" className="hover:underline flex items-center gap-2">
                  <span className="font-mono text-[#757580]">05.</span>
                  <span>{locale === 'ru' ? 'Защита данных (152-ФЗ)' : 'Data Privacy (152-FZ & GDPR)'}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Content Body (Right) */}
        <div className="lg:col-span-8 space-y-12 font-serif text-[#121212]">
          {/* 01. Video Standards */}
          <section id="video-specs" className="border-b border-[#000000]/20 pb-10">
            <span className="font-mono text-xs text-[#757580] block mb-2">
              {locale === 'ru' ? 'РАЗДЕЛ 01' : 'SECTION 01'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              {locale === 'ru' ? 'Технические требования к видеозаписи' : 'Video Performance Technical Requirements'}
            </h2>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                {locale === 'ru'
                  ? 'Конкурс проводится в дистанционном формате с гарантией подлинности исполнения. К участию допускаются видеозаписи, соответствующие следующим критериям:'
                  : 'The competition is held in remote format with strict performance authenticity verification. Video recordings must conform to the following criteria:'}
              </p>
              <ul className="space-y-2 list-none font-sans text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
                  <span>
                    <strong>{locale === 'ru' ? 'Непрерывный дубль:' : 'Continuous Take:'}</strong>{' '}
                    {locale === 'ru'
                      ? 'запись исполняется единым непрерывным планом от начала до конца без монтажных склеек.'
                      : 'the performance must be recorded in a single uncut take from beginning to end without edits or splices.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
                  <span>
                    <strong>{locale === 'ru' ? 'Запрет коррекции высоты тона:' : 'No Pitch Correction:'}</strong>{' '}
                    {locale === 'ru'
                      ? 'категорически запрещено применение Auto-Tune, Melodyne и любых программ питч-коррекции. Обнаружение искусственной коррекции ведет к немедленной дисквалификации.'
                      : 'the use of Auto-Tune, Melodyne, or any pitch-correction software is strictly prohibited. Detection leads to immediate disqualification.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
                  <span>
                    <strong>{locale === 'ru' ? 'Видимость исполнителя:' : 'Entrant Visibility:'}</strong>{' '}
                    {locale === 'ru'
                      ? 'участник должен быть чётко виден в полный рост или по пояс при стабильном освещении.'
                      : 'the performer must be clearly framed full-length or medium shot under stable acoustic lighting.'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
                  <span>
                    <strong>{locale === 'ru' ? 'Разрешение:' : 'Resolution:'}</strong>{' '}
                    {locale === 'ru'
                      ? 'минимальное качество Full HD 1080p с чистым акустическим звуком без клиппинга.'
                      : 'minimum 1080p Full HD resolution with clean acoustic capture free of clipping or distortion.'}
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* 02. Scoring Rubric */}
          <section id="scoring-rubric" className="border-b border-[#000000]/20 pb-10">
            <span className="font-mono text-xs text-[#757580] block mb-2">
              {locale === 'ru' ? 'РАЗДЕЛ 02' : 'SECTION 02'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              {locale === 'ru' ? '100-балльная шкала оценивания' : '100-Point Adjudication Rubric'}
            </h2>
            <p className="text-base leading-relaxed mb-6">
              {locale === 'ru'
                ? 'Каждый член экспертного жюри оценивает выступление независимо по четырём равнозначным критериям (по 25 баллов максимум каждый):'
                : 'Each jury member evaluates performances independently across four equally weighted criteria (up to 25 points each):'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-[#000000] p-4 bg-[#dedede]">
                <div className="flex justify-between font-mono text-xs text-[#757580] mb-1">
                  <span>{locale === 'ru' ? 'КРИТЕРИЙ 1' : 'CRITERION 1'}</span>
                  <span>{locale === 'ru' ? '25 БАЛЛОВ' : '25 PTS'}</span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#000000] mb-1">
                  {locale === 'ru' ? 'Вокальная техника и интонация' : 'Vocal Technique & Intonation'}
                </h4>
                <p className="text-xs font-serif text-[#121212]">
                  {locale === 'ru'
                    ? 'Чистота интонирования, дыхание, диапазон, регистровое выравнивание и дикционная точность.'
                    : 'Intonational accuracy, breath support, vocal range, registration balance, and diction clarity.'}
                </p>
              </div>

              <div className="border border-[#000000] p-4 bg-[#dedede]">
                <div className="flex justify-between font-mono text-xs text-[#757580] mb-1">
                  <span>{locale === 'ru' ? 'КРИТЕРИЙ 2' : 'CRITERION 2'}</span>
                  <span>{locale === 'ru' ? '25 БАЛЛОВ' : '25 PTS'}</span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#000000] mb-1">
                  {locale === 'ru' ? 'Музыкальность и фразировка' : 'Musicality & Phrasing'}
                </h4>
                <p className="text-xs font-serif text-[#121212]">
                  {locale === 'ru'
                    ? 'Чувство стиля, ритмическая стабильность, динамическая нюансировка и логика формы.'
                    : 'Stylistic awareness, rhythmic precision, dynamic subtlety, and structural phrasing logic.'}
                </p>
              </div>

              <div className="border border-[#000000] p-4 bg-[#dedede]">
                <div className="flex justify-between font-mono text-xs text-[#757580] mb-1">
                  <span>{locale === 'ru' ? 'КРИТЕРИЙ 3' : 'CRITERION 3'}</span>
                  <span>{locale === 'ru' ? '25 БАЛЛОВ' : '25 PTS'}</span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#000000] mb-1">
                  {locale === 'ru' ? 'Артистизм и сценический образ' : 'Artistry & Stage Presence'}
                </h4>
                <p className="text-xs font-serif text-[#121212]">
                  {locale === 'ru'
                    ? 'Эмоциональная глубина, убедительность интерпретации и контакт со слушателем.'
                    : 'Expressive depth, interpretive authenticity, and artistic audience connection.'}
                </p>
              </div>

              <div className="border border-[#000000] p-4 bg-[#dedede]">
                <div className="flex justify-between font-mono text-xs text-[#757580] mb-1">
                  <span>{locale === 'ru' ? 'КРИТЕРИЙ 4' : 'CRITERION 4'}</span>
                  <span>{locale === 'ru' ? '25 БАЛЛОВ' : '25 PTS'}</span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#000000] mb-1">
                  {locale === 'ru' ? 'Сложность репертуара' : 'Repertoire Complexity'}
                </h4>
                <p className="text-xs font-serif text-[#121212]">
                  {locale === 'ru'
                    ? 'Соответствие репертуара возрасту исполнителя и художественная зрелость выбора.'
                    : 'Suitability to entrant age division and technical and artistic maturity of programming.'}
                </p>
              </div>
            </div>
          </section>

          {/* 03. Awards Scale */}
          <section id="awards-scale" className="border-b border-[#000000]/20 pb-10">
            <span className="font-mono text-xs text-[#757580] block mb-2">
              {locale === 'ru' ? 'РАЗДЕЛ 03' : 'SECTION 03'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              {locale === 'ru' ? 'Таблица присуждения степеней и дипломов' : 'Award Degrees & Point Thresholds'}
            </h2>
            <div className="border border-[#000000] overflow-hidden">
              <table className="w-full text-left font-serif text-sm">
                <thead>
                  <tr className="border-b border-[#000000] bg-[#dedede] font-sans text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3 border-r border-[#000000]">
                      {locale === 'ru' ? 'Присуждаемая степень' : 'Awarded Distinction'}
                    </th>
                    <th className="p-3">
                      {locale === 'ru' ? 'Требуемый суммарный балл' : 'Required Cumulative Score'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#000000]">
                  {awardScale.map((row, i) => (
                    <tr key={i} className="hover:bg-[#dedede] transition-colors">
                      <td className={`p-3 border-r border-[#000000] ${row.color}`}>
                        {locale === 'ru' ? row.degreeRu : row.degreeEn}
                      </td>
                      <td className="p-3 font-mono text-xs">
                        {locale === 'ru' ? row.scoreRu : row.scoreEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 04. Teacher Royalty */}
          <section id="teacher-program" className="border-b border-[#000000]/20 pb-10">
            <span className="font-mono text-xs text-[#757580] block mb-2">
              {locale === 'ru' ? 'РАЗДЕЛ 04' : 'SECTION 04'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              {locale === 'ru' ? 'Партнёрская программа для преподавателей (20%)' : 'Teacher Royalty Program (20%)'}
            </h2>
            <p className="text-base leading-relaxed mb-4">
              {locale === 'ru'
                ? 'Платформа espressivo ART ценит вклад педагогов в подготовку юных дарований. За каждую оплаченную заявку, поданную по рекомендации педагога, начисляется партнерское вознаграждение в размере 20% от регистрационного взноса (500 ₽ с каждого сольного участия).'
                : 'espressivo ART honors the dedication of music pedagogues. For each completed entry submitted through a teacher recommendation, a 20% royalty is credited directly to the teacher account balance.'}
            </p>
            <p className="text-base leading-relaxed">
              {locale === 'ru'
                ? 'Выплаты осуществляются официально на расчетный счет или банковскую карту преподавателя по запросу в личном кабинете.'
                : 'Payouts are executed officially to bank accounts or payment cards upon request within the teacher workspace.'}
            </p>
          </section>

          {/* 05. 152-FZ Compliance */}
          <section id="compliance">
            <span className="font-mono text-xs text-[#757580] block mb-2">
              {locale === 'ru' ? 'РАЗДЕЛ 05' : 'SECTION 05'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              {locale === 'ru' ? 'Защита персональных данных (152-ФЗ и GDPR)' : 'Data Privacy Standards (152-FZ & GDPR)'}
            </h2>
            <p className="text-base leading-relaxed">
              {locale === 'ru'
                ? 'Все персональные данные несовершеннолетних участников и их законных представителей собираются исключительно для целей проведения конкурса, выдачи официальных дипломов и верификации результатов. Данные не передаются третьим лицам.'
                : 'All personal data of minor participants and their legal guardians is processed strictly for adjudication, official diploma issuance, and credential verification in accordance with 152-FZ and GDPR standards.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
