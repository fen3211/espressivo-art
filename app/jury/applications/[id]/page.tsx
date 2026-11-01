'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProtectedVideoPlayer } from '@/components/video/ProtectedVideoPlayer';
import { ArrowLeft, Save, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function JuryAdjudicationTerminalPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || 'app-001';

  // 4 Criteria Scores (0 to 25 each)
  const [scoreTechnique, setScoreTechnique] = useState<number>(24);
  const [scoreMusicality, setScoreMusicality] = useState<number>(25);
  const [scoreArtistry, setScoreArtistry] = useState<number>(24);
  const [scoreRepertoire, setScoreRepertoire] = useState<number>(23);

  const [comment, setComment] = useState<string>(
    'Великолепное владение кантиленой и чистота интонирования в среднем регистре. Прекрасное ощущение барочной фразировки. Рекомендуется обратить внимание на опору дыхания в верхних кульминационных нотах.'
  );

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const totalScore = scoreTechnique + scoreMusicality + scoreArtistry + scoreRepertoire;

  // Calculate projected award
  let projectedAward = 'Грамота за участие';
  let badgeStatus = 'PARTICIPANT';

  if (totalScore === 100) {
    projectedAward = 'Гран-при (Grand Prix)';
    badgeStatus = 'GRAND_PRIX';
  } else if (totalScore >= 95) {
    projectedAward = 'Лауреат I степени';
    badgeStatus = 'LAUREATE_1';
  } else if (totalScore >= 90) {
    projectedAward = 'Лауреат II степени';
    badgeStatus = 'LAUREATE_2';
  } else if (totalScore >= 85) {
    projectedAward = 'Лауреат III степени';
    badgeStatus = 'LAUREATE_3';
  } else if (totalScore >= 80) {
    projectedAward = 'Дипломант';
    badgeStatus = 'DIPLOMANT';
  }

  const handleSaveDraft = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    }, 400);
  };

  const handleFinalize = async () => {
    setLoading(true);
    setConfirmModalOpen(false);

    try {
      await fetch(`/api/jury/applications/${id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scoreTechnique,
          scoreMusicality,
          scoreArtistry,
          scoreRepertoire,
          totalScore,
          comment,
          isDraft: false,
        }),
      });
    } catch {
      // Mock submit
    }

    setTimeout(() => {
      setLoading(false);
      router.push('/jury/evaluations');
    }, 500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#2a2a32]">
        <div>
          <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            <Link href="/jury/applications" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>К очереди оценивания</span>
            </Link>
            <span>/</span>
            <span>ENTRY // EXP-2026-0042</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-medium text-[#fcfcfc]">
            Терминал оценивания: Дж. Перголези — Канцона &quot;Se tu m&apos;ami&quot;
          </h1>
          <p className="text-xs text-[#a3a3b3]">
            Академический вокал (Соло) • Группа II (12–14 лет) • Хронометраж: 3:30 мин
          </p>
        </div>

        {/* Live Total Score Pill */}
        <div className="flex items-center gap-3">
          <div className="px-5 py-2 rounded-full bg-[#040407] border border-[#4f4f80] flex items-center gap-3 shadow-[0_0_16px_rgba(97,153,246,0.15)]">
            <span className="text-xs text-[#757580] uppercase font-mono">Сумма баллов:</span>
            <span className="text-2xl font-mono font-bold text-[#6199f6]">
              {totalScore} <span className="text-xs text-[#757580]">/ 100</span>
            </span>
          </div>
          <Badge status={badgeStatus} label={projectedAward} />
        </div>
      </div>

      {/* Main Terminal Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video Player */}
        <div className="lg:col-span-7 space-y-4">
          <ProtectedVideoPlayer
            videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            title="Дж. Перголези — Канцона 'Se tu m'ami'"
            participantCode="EXP-2026-0042"
          />

          <div className="p-3 rounded-[8px] bg-[#08080c] border border-[#2a2a32] text-xs text-[#757580] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6199f6]" />
              <span>Режим слепого прослушивания скрывает персональные данные участника</span>
            </div>
            <span className="font-mono text-[#dedfee]">1080p verified</span>
          </div>
        </div>

        {/* Right: 4 Criterion Sliders & Critique Form */}
        <div className="lg:col-span-5 space-y-5">
          <Card padding="md" className="space-y-5">
            <div className="border-b border-[#2a2a32] pb-3 flex justify-between items-center">
              <h3 className="text-sm font-medium text-[#fcfcfc] uppercase font-mono">
                Критерии оценивания (100 баллов)
              </h3>
              <span className="text-[10px] font-mono text-[#6199f6]">4 x 25 PTS</span>
            </div>

            {/* Slider 1: Technique */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-medium text-[#fcfcfc]">1. Вокальная техника и интонация</span>
                  <div className="text-[11px] text-[#757580]">Чистота строя, опора дыхания, дикция</div>
                </div>
                <span className="font-mono text-base font-bold text-[#6199f6]">
                  {scoreTechnique} <span className="text-xs text-[#757580]">/ 25</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={scoreTechnique}
                onChange={(e) => setScoreTechnique(parseInt(e.target.value, 10))}
                className="w-full accent-[#6199f6] cursor-pointer h-2 bg-[#181826] rounded-lg"
              />
            </div>

            {/* Slider 2: Musicality */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-medium text-[#fcfcfc]">2. Музыкальность и фразировка</span>
                  <div className="text-[11px] text-[#757580]">Чувство стиля, ритмика, динамические оттенки</div>
                </div>
                <span className="font-mono text-base font-bold text-[#6199f6]">
                  {scoreMusicality} <span className="text-xs text-[#757580]">/ 25</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={scoreMusicality}
                onChange={(e) => setScoreMusicality(parseInt(e.target.value, 10))}
                className="w-full accent-[#6199f6] cursor-pointer h-2 bg-[#181826] rounded-lg"
              />
            </div>

            {/* Slider 3: Artistry */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-medium text-[#fcfcfc]">3. Артистизм и сценический образ</span>
                  <div className="text-[11px] text-[#757580]">Эмоциональность, раскрытие художественного замысла</div>
                </div>
                <span className="font-mono text-base font-bold text-[#6199f6]">
                  {scoreArtistry} <span className="text-xs text-[#757580]">/ 25</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={scoreArtistry}
                onChange={(e) => setScoreArtistry(parseInt(e.target.value, 10))}
                className="w-full accent-[#6199f6] cursor-pointer h-2 bg-[#181826] rounded-lg"
              />
            </div>

            {/* Slider 4: Repertoire */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-medium text-[#fcfcfc]">4. Сложность репертуара</span>
                  <div className="text-[11px] text-[#757580]">Соответствие возрасту и технической зрелости</div>
                </div>
                <span className="font-mono text-base font-bold text-[#6199f6]">
                  {scoreRepertoire} <span className="text-xs text-[#757580]">/ 25</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={scoreRepertoire}
                onChange={(e) => setScoreRepertoire(parseInt(e.target.value, 10))}
                className="w-full accent-[#6199f6] cursor-pointer h-2 bg-[#181826] rounded-lg"
              />
            </div>

            {/* Written Critique Textarea */}
            <div className="space-y-2 pt-2 border-t border-[#2a2a32]">
              <label className="text-xs font-medium text-[#a3a3b3] block">
                Письменная рецензия для участника и педагога:
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Укажите сильные стороны исполнения и рекомендации для дальнейшего роста..."
                className="w-full p-3 rounded-[8px] bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#2a2a32]">
              <Button
                variant="ghost"
                size="md"
                loading={loading}
                iconLeft={<Save className="w-4 h-4" />}
                onClick={handleSaveDraft}
              >
                {draftSaved ? 'Черновик сохранен' : 'Сохранить черновик'}
              </Button>

              <Button
                variant="iris-action"
                size="md"
                className="flex-1"
                iconLeft={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => setConfirmModalOpen(true)}
              >
                Финализировать оценку ({totalScore})
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Warning Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Подтверждение финализации судейства"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Вернуться к редактированию
            </Button>
            <Button variant="iris-action" size="sm" loading={loading} onClick={handleFinalize}>
              Подписать и зафиксировать оценку
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-amber-400">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm text-[#fcfcfc]">
                Внимание: фиксация оценки необратима
              </div>
              <div className="text-xs text-[#a3a3b3] mt-1 leading-relaxed">
                Вы выставляете <strong className="text-[#6199f6]">{totalScore} баллов</strong> (прогнозируется: <strong>{projectedAward}</strong>). После подтверждения протокол будет заблокирован для изменений и подписан вашим цифровым профилем жюри.
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
