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
    { degreeRu: 'Гран-при (Grand Prix)', degreeEn: 'Grand Prix', score: '100 баллов (единогласно)', color: 'text-black font-bold' },
    { degreeRu: 'Лауреат I степени', degreeEn: 'Laureate 1st Degree', score: '95–99 баллов', color: 'text-black' },
    { degreeRu: 'Лауреат II степени', degreeEn: 'Laureate 2nd Degree', score: '90–94 балла', color: 'text-black' },
    { degreeRu: 'Лауреат III степени', degreeEn: 'Laureate 3rd Degree', score: '85–89 баллов', color: 'text-black' },
    { degreeRu: 'Дипломант', degreeEn: 'Diplomant', score: '80–84 балла', color: 'text-black' },
    { degreeRu: 'Грамота за участие', degreeEn: 'Certificate of Participation', score: 'менее 80 баллов', color: 'text-[#757580]' },
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
                  <span>Требования к видеозаписи</span>
                </a>
              </li>
              <li>
                <a href="#scoring-rubric" className="hover:underline flex items-center gap-2">
                  <span className="font-mono text-[#757580]">02.</span>
                  <span>100-балльная шкала жюри</span>
                </a>
              </li>
              <li>
                <a href="#awards-scale" className="hover:underline flex items-center gap-2">
                  <span className="font-mono text-[#757580]">03.</span>
                  <span>Присуждение степеней</span>
                </a>
              </li>
              <li>
                <a href="#teacher-program" className="hover:underline flex items-center gap-2">
                  <span className="font-mono text-[#757580]">04.</span>
                  <span>Партнёрская программа 20%</span>
                </a>
              </li>
              <li>
                <a href="#compliance" className="hover:underline flex items-center gap-2">
                  <span className="font-mono text-[#757580]">05.</span>
                  <span>Защита данных (152-ФЗ)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Content Body (Right) */}
        <div className="lg:col-span-8 space-y-12 font-serif text-[#121212]">
          {/* 01. Video Standards */}
          <section id="video-specs" className="border-b border-[#000000]/20 pb-10">
            <span className="font-mono text-xs text-[#757580] block mb-2">РАЗДЕЛ 01</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              Технические требования к видеозаписи
            </h2>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                Конкурс проводится в дистанционном формате с гарантией подлинности исполнения. К участию допускаются видеозаписи, соответствующие следующим критериям:
              </p>
              <ul className="space-y-2 list-none font-sans text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
                  <span><strong>Непрерывный дубль:</strong> запись исполняется единым непрерывным планом от начала до конца без монтажных склеек.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
                  <span><strong>Запрет коррекции высоты тона:</strong> категорически запрещено применение Auto-Tune, Melodyne и любых программ питч-коррекции. Обнаружение искусственной коррекции ведет к немедленной дисквалификации.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
                  <span><strong>Видимость исполнителя:</strong> участник должен быть чётко виден в полный рост или по пояс при стабильном освещении.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
                  <span><strong>Разрешение:</strong> минимальное качество Full HD 1080p с чистым акустическим звуком без клиппинга.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 02. Scoring Rubric */}
          <section id="scoring-rubric" className="border-b border-[#000000]/20 pb-10">
            <span className="font-mono text-xs text-[#757580] block mb-2">РАЗДЕЛ 02</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              100-балльная шкала оценивания
            </h2>
            <p className="text-base leading-relaxed mb-6">
              Каждый член экспертного жюри оценивает выступление независимо по четырём равнозначным критериям (по 25 баллов максимум каждый):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-[#000000] p-4 bg-[#dedede]">
                <div className="flex justify-between font-mono text-xs text-[#757580] mb-1">
                  <span>КРИТЕРИЙ 1</span>
                  <span>25 БАЛЛОВ</span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#000000] mb-1">Вокальная техника и интонация</h4>
                <p className="text-xs font-serif text-[#121212]">
                  Чистота интонирования, дыхание, диапазон, регистровое выравнивание и дикционная точность.
                </p>
              </div>

              <div className="border border-[#000000] p-4 bg-[#dedede]">
                <div className="flex justify-between font-mono text-xs text-[#757580] mb-1">
                  <span>КРИТЕРИЙ 2</span>
                  <span>25 БАЛЛОВ</span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#000000] mb-1">Музыкальность и фразировка</h4>
                <p className="text-xs font-serif text-[#121212]">
                  Чувство стиля, ритмическая стабильность, динамическая нюансировка и логика формы.
                </p>
              </div>

              <div className="border border-[#000000] p-4 bg-[#dedede]">
                <div className="flex justify-between font-mono text-xs text-[#757580] mb-1">
                  <span>КРИТЕРИЙ 3</span>
                  <span>25 БАЛЛОВ</span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#000000] mb-1">Артистизм и сценический образ</h4>
                <p className="text-xs font-serif text-[#121212]">
                  Эмоциональная глубина, убедительность интерпретации и контакт со слушателем.
                </p>
              </div>

              <div className="border border-[#000000] p-4 bg-[#dedede]">
                <div className="flex justify-between font-mono text-xs text-[#757580] mb-1">
                  <span>КРИТЕРИЙ 4</span>
                  <span>25 БАЛЛОВ</span>
                </div>
                <h4 className="text-base font-serif font-bold text-[#000000] mb-1">Сложность репертуара</h4>
                <p className="text-xs font-serif text-[#121212]">
                  Соответствие репертуара возрасту исполнителя и художественная зрелость выбора.
                </p>
              </div>
            </div>
          </section>

          {/* 03. Awards Scale */}
          <section id="awards-scale" className="border-b border-[#000000]/20 pb-10">
            <span className="font-mono text-xs text-[#757580] block mb-2">РАЗДЕЛ 03</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              Таблица присуждения степеней и дипломов
            </h2>
            <div className="border border-[#000000] overflow-hidden">
              <table className="w-full text-left font-serif text-sm">
                <thead>
                  <tr className="border-b border-[#000000] bg-[#dedede] font-sans text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3 border-r border-[#000000]">Присуждаемая степень</th>
                    <th className="p-3">Требуемый суммарный балл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#000000]">
                  {awardScale.map((row, i) => (
                    <tr key={i} className="hover:bg-[#dedede] transition-colors">
                      <td className={`p-3 border-r border-[#000000] ${row.color}`}>
                        {locale === 'ru' ? row.degreeRu : row.degreeEn}
                      </td>
                      <td className="p-3 font-mono text-xs">{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 04. Teacher Royalty */}
          <section id="teacher-program" className="border-b border-[#000000]/20 pb-10">
            <span className="font-mono text-xs text-[#757580] block mb-2">РАЗДЕЛ 04</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              Партнёрская программа для преподавателей (20%)
            </h2>
            <p className="text-base leading-relaxed mb-4">
              Платформа espressivo ART ценит вклад педагогов в подготовку юных дарований. За каждую оплаченную заявку, поданную по рекомендации педагога, начисляется партнерское вознаграждение в размере 20% от регистрационного взноса (500 ₽ с каждого сольного участия).
            </p>
            <p className="text-base leading-relaxed">
              Выплаты осуществляются официально на расчетный счет или банковскую карту преподавателя по запросу в личном кабинете.
            </p>
          </section>

          {/* 05. 152-FZ Compliance */}
          <section id="compliance">
            <span className="font-mono text-xs text-[#757580] block mb-2">РАЗДЕЛ 05</span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#000000] mb-4">
              Защита персональных данных (152-ФЗ и GDPR)
            </h2>
            <p className="text-base leading-relaxed">
              Все персональные данные несовершеннолетних участников и их законных представителей собираются исключительно для целей проведения конкурса, выдачи официальных дипломов и верификации результатов. Данные не передаются третьим лицам.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
