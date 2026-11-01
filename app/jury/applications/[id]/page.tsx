'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProtectedVideoPlayer } from '@/components/video/ProtectedVideoPlayer';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Volume2,
} from 'lucide-react';

interface JuryApplicationData {
  id: string;
  applicationId: string;
  code: string;
  competitionTitleRu: string;
  competitionTitleEn: string;
  nominationTitleRu: string;
  nominationTitleEn: string;
  ageCategoryTitleRu: string;
  ageCategoryTitleEn: string;
  repertoire: string;
  performanceDuration?: number | null;
  videoUrl: string;
  videoProvider: string;
  status: string;
  isBlindModeDefault: boolean;
  hasEvaluation: boolean;
  evaluationDraft?: {
    scoreTechnique: number;
    scoreMusicality: number;
    scoreArtistry: number;
    scoreRepertoire: number;
    totalScore: number;
    comment: string;
    isDraft: boolean;
    isLocked: boolean;
  } | null;
}

export default function JuryAdjudicationTerminalPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';
  const { locale, dict } = useLanguage();

  const [appData, setAppData] = useState<JuryApplicationData | null>(null);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 4 Criteria Scores (0 to 25 each)
  const [scoreTechnique, setScoreTechnique] = useState<number>(20);
  const [scoreMusicality, setScoreMusicality] = useState<number>(20);
  const [scoreArtistry, setScoreArtistry] = useState<number>(20);
  const [scoreRepertoire, setScoreRepertoire] = useState<number>(20);
  const [comment, setComment] = useState<string>('');

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load real application details for the assigned jury member
  useEffect(() => {
    let isMounted = true;
    async function loadApplication() {
      if (!id) return;
      setLoadingInitial(true);
      setFetchError(null);

      try {
        const res = await fetch(`/api/jury/applications/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load application');
        }

        if (isMounted) {
          setAppData(data);
          if (data.evaluationDraft) {
            setScoreTechnique(data.evaluationDraft.scoreTechnique || 0);
            setScoreMusicality(data.evaluationDraft.scoreMusicality || 0);
            setScoreArtistry(data.evaluationDraft.scoreArtistry || 0);
            setScoreRepertoire(data.evaluationDraft.scoreRepertoire || 0);
            setComment(data.evaluationDraft.comment || '');
            setIsLocked(Boolean(data.evaluationDraft.isLocked));
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const e = err as Error;
          setFetchError(e.message || 'Error loading jury workstation');
        }
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    }

    loadApplication();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const totalScore = scoreTechnique + scoreMusicality + scoreArtistry + scoreRepertoire;

  // Calculate projected award
  let projectedAward = dict.awards.PARTICIPANT;
  let badgeStatus = 'PARTICIPANT';

  if (totalScore === 100) {
    projectedAward = dict.awards.GRAND_PRIX;
    badgeStatus = 'GRAND_PRIX';
  } else if (totalScore >= 95) {
    projectedAward = dict.awards.LAUREATE_1;
    badgeStatus = 'LAUREATE_1';
  } else if (totalScore >= 90) {
    projectedAward = dict.awards.LAUREATE_2;
    badgeStatus = 'LAUREATE_2';
  } else if (totalScore >= 85) {
    projectedAward = dict.awards.LAUREATE_3;
    badgeStatus = 'LAUREATE_3';
  } else if (totalScore >= 80) {
    projectedAward = dict.awards.DIPLOMANT;
    badgeStatus = 'DIPLOMANT';
  }

  const handleSaveDraft = async () => {
    if (isLocked) return;
    setActionLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/jury/applications/${id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scoreTechnique,
          scoreMusicality,
          scoreArtistry,
          scoreRepertoire,
          totalScore,
          comment,
          isDraft: true,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to save draft');
      }

      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch (err: unknown) {
      const e = err as Error;
      setSubmitError(e.message || 'Error saving evaluation draft');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (isLocked) return;
    setActionLoading(true);
    setConfirmModalOpen(false);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/jury/applications/${id}/evaluate`, {
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
          isFinalSubmit: true,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to finalize evaluation');
      }

      setIsLocked(true);
      setTimeout(() => {
        router.push('/jury/evaluations');
      }, 700);
    } catch (err: unknown) {
      const e = err as Error;
      setSubmitError(e.message || 'Error finalizing evaluation');
      setActionLoading(false);
    }
  };

  // 1. Loading State
  if (loadingInitial) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-[#6199f6] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-mono text-[#a3a3b3]">
          {locale === 'ru' ? 'Загрузка материалов слепого прослушивания...' : 'Loading blind audition materials...'}
        </p>
      </div>
    );
  }

  // 2. Error / Not Assigned / Not Found State
  if (fetchError || !appData) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-[#fcfcfc]">
            {locale === 'ru' ? 'Ошибка доступа к конкурсному номеру' : 'Access Error to Competition Entry'}
          </h2>
          <p className="text-sm text-[#8f8fa3]">
            {fetchError || (locale === 'ru' ? 'Заявка не найдена или не назначена вам на оценку.' : 'Entry not found or not assigned to your panel.')}
          </p>
        </div>
        <Link
          href="/jury/applications"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#181826] hover:bg-[#2a2a32] text-sm text-[#fcfcfc] border border-[#4f4f80]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{dict.jury.terminal.backToQueue}</span>
        </Link>
      </div>
    );
  }

  const competitionTitle =
    locale === 'ru' ? appData.competitionTitleRu : appData.competitionTitleEn;
  const nominationTitle =
    locale === 'ru' ? appData.nominationTitleRu : appData.nominationTitleEn;
  const ageCategoryTitle =
    locale === 'ru' ? appData.ageCategoryTitleRu : appData.ageCategoryTitleEn;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#2a2a32]">
        <div>
          <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-[#6199f6] mb-1">
            <Link href="/jury/applications" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{dict.jury.terminal.backToQueue}</span>
            </Link>
            <span>/</span>
            <span>ENTRY // {appData.code}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-medium text-[#fcfcfc]">
            {appData.repertoire}
          </h1>
          <p className="text-xs text-[#a3a3b3]">
            {competitionTitle} • {nominationTitle} • {ageCategoryTitle}
            {appData.performanceDuration ? ` • ${Math.floor(appData.performanceDuration / 60)}:${(appData.performanceDuration % 60).toString().padStart(2, '0')}` : ''}
          </p>
        </div>

        {/* Live Total Score Pill */}
        <div className="flex items-center gap-3">
          <div className="px-5 py-2 rounded-full bg-[#040407] border border-[#4f4f80] flex items-center gap-3 shadow-[0_0_16px_rgba(97,153,246,0.15)]">
            <span className="text-xs text-[#757580] uppercase font-mono">
              {locale === 'ru' ? 'Сумма баллов:' : 'Total Score:'}
            </span>
            <span className="text-2xl font-mono font-bold text-[#6199f6]">
              {totalScore} <span className="text-xs text-[#757580]">/ 100</span>
            </span>
          </div>
          <Badge status={badgeStatus} label={projectedAward} />
        </div>
      </div>

      {/* Locked Notice if already finalized */}
      {isLocked && (
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center gap-3 text-xs text-blue-200">
          <Lock className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            {locale === 'ru'
              ? 'Оценка по данному номеру окончательно зафиксирована и заблокирована от изменений.'
              : 'Evaluation for this entry has been finalized and locked from modifications.'}
          </span>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-xs text-red-200">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Main Terminal Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video Player */}
        <div className="lg:col-span-7 space-y-4">
          <ProtectedVideoPlayer
            videoUrl={appData.videoUrl}
            title={appData.repertoire}
            participantCode={appData.code}
            isBlindMode={true}
          />

          <div className="p-3 rounded-[8px] bg-[#08080c] border border-[#2a2a32] text-xs text-[#757580] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6199f6]" />
              <span>{dict.jury.terminal.blindListeningNotice}</span>
            </div>
            <span className="font-mono text-[#dedfee]">blind mode verified</span>
          </div>
        </div>

        {/* Right: 4 Criterion Sliders & Critique Form */}
        <div className="lg:col-span-5 space-y-5">
          <Card padding="md" className="space-y-5">
            <div className="border-b border-[#2a2a32] pb-3 flex justify-between items-center">
              <h3 className="text-sm font-medium text-[#fcfcfc] uppercase font-mono">
                {dict.jury.terminal.rubricTitle}
              </h3>
              <span className="text-[10px] font-mono text-[#6199f6]">4 x 25 PTS</span>
            </div>

            {/* Slider 1: Technique */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-medium text-[#fcfcfc]">{dict.jury.terminal.criterion1Title}</span>
                  <div className="text-[11px] text-[#757580]">{dict.jury.terminal.criterion1Desc}</div>
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
                disabled={isLocked}
                value={scoreTechnique}
                onChange={(e) => setScoreTechnique(parseInt(e.target.value, 10))}
                className="w-full accent-[#6199f6] cursor-pointer h-2 bg-[#181826] rounded-lg disabled:opacity-50"
              />
            </div>

            {/* Slider 2: Musicality */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-medium text-[#fcfcfc]">{dict.jury.terminal.criterion2Title}</span>
                  <div className="text-[11px] text-[#757580]">{dict.jury.terminal.criterion2Desc}</div>
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
                disabled={isLocked}
                value={scoreMusicality}
                onChange={(e) => setScoreMusicality(parseInt(e.target.value, 10))}
                className="w-full accent-[#6199f6] cursor-pointer h-2 bg-[#181826] rounded-lg disabled:opacity-50"
              />
            </div>

            {/* Slider 3: Artistry */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-medium text-[#fcfcfc]">{dict.jury.terminal.criterion3Title}</span>
                  <div className="text-[11px] text-[#757580]">{dict.jury.terminal.criterion3Desc}</div>
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
                disabled={isLocked}
                value={scoreArtistry}
                onChange={(e) => setScoreArtistry(parseInt(e.target.value, 10))}
                className="w-full accent-[#6199f6] cursor-pointer h-2 bg-[#181826] rounded-lg disabled:opacity-50"
              />
            </div>

            {/* Slider 4: Repertoire */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-medium text-[#fcfcfc]">{dict.jury.terminal.criterion4Title}</span>
                  <div className="text-[11px] text-[#757580]">{dict.jury.terminal.criterion4Desc}</div>
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
                disabled={isLocked}
                value={scoreRepertoire}
                onChange={(e) => setScoreRepertoire(parseInt(e.target.value, 10))}
                className="w-full accent-[#6199f6] cursor-pointer h-2 bg-[#181826] rounded-lg disabled:opacity-50"
              />
            </div>

            {/* Written Critique Textarea */}
            <div className="space-y-2 pt-2 border-t border-[#2a2a32]">
              <label className="text-xs font-medium text-[#a3a3b3] block">
                {locale === 'ru'
                  ? 'Письменная рецензия для участника и педагога:'
                  : 'Written critique for entrant & pedagogue:'}
              </label>
              <textarea
                rows={4}
                disabled={isLocked}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={dict.jury.terminal.critiquePlaceholder}
                className="w-full p-3 rounded-[8px] bg-[#040407] border border-[#2a2a32] text-xs text-[#fcfcfc] placeholder:text-[#757580] focus:outline-none focus:border-[#6199f6] resize-none disabled:opacity-50"
              />
            </div>

            {/* Actions */}
            {!isLocked && (
              <div className="flex items-center gap-3 pt-3 border-t border-[#2a2a32]">
                <Button
                  variant="ghost"
                  size="md"
                  loading={actionLoading}
                  iconLeft={<Save className="w-4 h-4" />}
                  onClick={handleSaveDraft}
                >
                  {draftSaved
                    ? locale === 'ru'
                      ? 'Черновик сохранен'
                      : 'Draft Saved'
                    : dict.jury.terminal.saveDraftBtn}
                </Button>

                <Button
                  variant="iris-action"
                  size="md"
                  className="flex-1"
                  loading={actionLoading}
                  iconLeft={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => setConfirmModalOpen(true)}
                >
                  {locale === 'ru'
                    ? `Финализировать оценку (${totalScore})`
                    : `Finalize Score (${totalScore})`}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirmation Warning Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={dict.jury.terminal.confirmModalTitle}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmModalOpen(false)}>
              {dict.jury.terminal.confirmNoBtn}
            </Button>
            <Button variant="iris-action" size="sm" loading={actionLoading} onClick={handleFinalize}>
              {dict.jury.terminal.confirmYesBtn}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-amber-400">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm text-[#fcfcfc]">
                {locale === 'ru'
                  ? 'Внимание: фиксация оценки необратима'
                  : 'Notice: score submission is irreversible'}
              </div>
              <div className="text-xs text-[#a3a3b3] mt-1 leading-relaxed">
                {dict.jury.terminal.confirmModalWarning}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
