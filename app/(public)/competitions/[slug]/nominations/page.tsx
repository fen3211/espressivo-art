'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/Button';

export default function NominationsPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'espressivo-vocal-young-talents';
  const { locale } = useLanguage();

  const nominations = [
    {
      code: 'VOC-A',
      titleRu: 'Номинация A: Академический и классический вокал (Соло)',
      titleEn: 'Nomination A: Academic & Classical Vocal (Solo)',
      repertoireRu: '1 конкурсное произведение: оперная ария, старинная ария, классический романс или духовное сочинение. Исполнение на языке оригинала.',
      repertoireEn: '1 competition piece: opera aria, antique canzona, classical art romance, or sacred composition. In the original language.',
      timeLimit: 'до 4 минут 30 секунд',
      accompanimentRu: 'Фортепиано живьем или качественная инструментальная фонограмма минус 1.',
      accompanimentEn: 'Live piano accompaniment or high-quality minus-one audio track.',
    },
    {
      code: 'VOC-B',
      titleRu: 'Номинация B: Эстрадный и современный вокал (Соло)',
      titleEn: 'Nomination B: Pop & Contemporary Vocal (Solo)',
      repertoireRu: '1 произведение: мировая эстрадная классика, современная авторская песня, баллада или акустическая интерпретация.',
      repertoireEn: '1 piece: contemporary world pop repertoire, original compositions, acoustic arrangements.',
      timeLimit: 'до 4 минут 00 секунд',
      accompanimentRu: 'Качественная фонограмма минус 1 без бэк-вокалов, дублирующих основную мелодию.',
      accompanimentEn: 'Minus-one audio track without guide backing vocals on the main melodic line.',
    },
    {
      code: 'VOC-C',
      titleRu: 'Номинация C: Джазовый вокал и импровизация (Соло)',
      titleEn: 'Nomination C: Jazz Vocal & Scat Improvisation (Solo)',
      repertoireRu: '1 джазовый стандарт, блюзовая баллада или соул-произведение. Приветствуется демонстрация вокальной импровизации (скэт).',
      repertoireEn: '1 jazz standard, blues ballad, or soul work. Demonstrations of vocal scat improvisation encouraged.',
      timeLimit: 'до 4 минут 30 секунд',
      accompanimentRu: 'Инструментальное трио, рояль или качественный инструментальный минус.',
      accompanimentEn: 'Live jazz combo, piano, or verified instrumental backing track.',
    },
    {
      code: 'VOC-D',
      titleRu: 'Номинация D: Народный и этно-вокал (Соло)',
      titleEn: 'Nomination D: Traditional Folk & Ethno Vocal (Solo)',
      repertoireRu: 'Аутентичный фольклор своего региона или стилизованная народная песня. Допускается исполнение a cappella.',
      repertoireEn: 'Authentic regional folklore or stylized folk arrangement. A cappella performances welcome.',
      timeLimit: 'до 4 минут 00 секунд',
      accompanimentRu: 'Традиционные народные инструменты или a cappella.',
      accompanimentEn: 'Traditional acoustic folk instruments or a cappella.',
    },
    {
      code: 'VOC-E',
      titleRu: 'Номинация E: Вокальные ансамбли и дуэты',
      titleEn: 'Nomination E: Vocal Ensembles & Duets (Chamber)',
      repertoireRu: '1 разнохарактерное произведение с демонстрацией многоголосия (от 2 до 12 человек в составе).',
      repertoireEn: '1 polyphonic work showcasing harmony and vocal blending (2 to 12 performers).',
      timeLimit: 'до 6 минут 00 секунд',
      accompanimentRu: 'Любой тип аккомпанемента или a cappella.',
      accompanimentEn: 'Any verified accompaniment format or a cappella.',
    },
  ];

  const ageGroups = [
    { code: 'GROUP-0', nameRu: 'Дебют', nameEn: 'Debut', ageRu: '6–8 полных лет', ageEn: '6–8 years', maxDur: '3:30' },
    { code: 'GROUP-I', nameRu: 'Младшая', nameEn: 'Junior', ageRu: '9–11 полных лет', ageEn: '9–11 years', maxDur: '4:00' },
    { code: 'GROUP-II', nameRu: 'Средняя', nameEn: 'Intermediate', ageRu: '12–14 полных лет', ageEn: '12–14 years', maxDur: '4:30' },
    { code: 'GROUP-III', nameRu: 'Старшая', nameEn: 'Advanced', ageRu: '15–17 полных лет', ageEn: '15–17 years', maxDur: '5:00' },
    { code: 'GROUP-IV', nameRu: 'Молодёжная / Мастера', nameEn: 'Youth Master', ageRu: '18–22 года', ageEn: '18–22 years', maxDur: '5:00' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-16">
      {/* Breadcrumb / Title */}
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
          <span className="text-[#000000]">NOMINATIONS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif text-[#000000] tracking-tight">
          {locale === 'ru' ? 'Номинации и возрастные категории' : 'Nominations & Age Brackets'}
        </h1>
        <p className="text-base sm:text-lg font-serif text-[#121212] mt-4 max-w-3xl">
          {locale === 'ru'
            ? 'Официальная классификация репертуарных требований сезона espressivo VOCAL 2026. Ознакомьтесь с временными лимитами перед подачей видеозаписи.'
            : 'Official repertoire specifications and age categories for the espressivo VOCAL 2026 season.'}
        </p>
      </div>

      {/* Nominations Spec Sheet */}
      <div className="space-y-8 mb-16">
        <h2 className="text-2xl font-serif text-[#000000] pb-2 border-b border-[#000000]">
          {locale === 'ru' ? 'Каталог номинаций' : 'Nominations Directory'}
        </h2>

        {nominations.map((nom) => (
          <div
            key={nom.code}
            className="border border-[#000000] p-6 sm:p-8 hover:bg-[#dedede] transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#000000]/15 pb-4 mb-4">
              <span className="font-mono text-xs font-bold text-[#757580]">{nom.code}</span>
              <span className="text-[10px] uppercase font-sans font-bold tracking-widest px-2.5 py-1 border border-[#000000] bg-[#000000] text-white">
                Лимит: {nom.timeLimit}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif text-[#000000] mb-3">
              {locale === 'ru' ? nom.titleRu : nom.titleEn}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-serif text-[#121212] mt-4 pt-4 border-t border-[#000000]/15">
              <div>
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#757580] block mb-1">
                  {locale === 'ru' ? 'Требования к репертуару' : 'Repertoire Requirements'}
                </span>
                <p>{locale === 'ru' ? nom.repertoireRu : nom.repertoireEn}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#757580] block mb-1">
                  {locale === 'ru' ? 'Аккомпанемент' : 'Accompaniment'}
                </span>
                <p>{locale === 'ru' ? nom.accompanimentRu : nom.accompanimentEn}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Age Category Matrix Table */}
      <div className="mb-16">
        <h2 className="text-2xl font-serif text-[#000000] pb-2 border-b border-[#000000] mb-6">
          {locale === 'ru' ? 'Сетка возрастных категорий' : 'Age Division Matrix'}
        </h2>

        <div className="border border-[#000000] overflow-x-auto">
          <table className="w-full text-left border-collapse font-serif">
            <thead>
              <tr className="border-b border-[#000000] bg-[#dedede] font-sans text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4 border-r border-[#000000]">Код группы</th>
                <th className="p-4 border-r border-[#000000]">Название категории</th>
                <th className="p-4 border-r border-[#000000]">Возраст на дату подачи</th>
                <th className="p-4">Макс. хронометраж</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#000000]">
              {ageGroups.map((grp) => (
                <tr key={grp.code} className="hover:bg-[#dedede] transition-colors">
                  <td className="p-4 font-mono text-xs text-[#757580] border-r border-[#000000]">
                    {grp.code}
                  </td>
                  <td className="p-4 text-base font-semibold border-r border-[#000000]">
                    {locale === 'ru' ? grp.nameRu : grp.nameEn}
                  </td>
                  <td className="p-4 text-sm border-r border-[#000000]">
                    {locale === 'ru' ? grp.ageRu : grp.ageEn}
                  </td>
                  <td className="p-4 font-mono text-xs">{grp.maxDur} мин</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border border-[#000000] p-8 text-center bg-[#000000] text-[#ffffff]">
        <h3 className="text-2xl font-serif text-[#ffffff] mb-3">
          {locale === 'ru' ? 'Определились с номинацией?' : 'Selected Your Discipline?'}
        </h3>
        <p className="text-sm font-serif text-[#dedfee] max-w-lg mx-auto mb-6">
          {locale === 'ru'
            ? 'Перейдите к оформлению заявки. Номинацию и категорию можно будет указать на втором шаге мастера.'
            : 'Proceed to entrant submission wizard. Select your category during step 2 of the application.'}
        </p>
        <Link href="/register">
          <Button variant="solid-ink" size="lg" className="!bg-[#ffffff] !text-[#000000] hover:!bg-[#e7e7e7]">
            {locale === 'ru' ? 'Перейти к подаче заявки' : 'Submit Entry Now'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
