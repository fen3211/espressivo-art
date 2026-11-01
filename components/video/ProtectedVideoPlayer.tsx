'use client';

import React, { useState, useMemo } from 'react';
import { EyeOff, Eye, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';

export interface ProtectedVideoPlayerProps {
  videoUrl: string;
  title?: string;
  participantCode?: string;
  isBlindMode?: boolean;
  className?: string;
}

export function ProtectedVideoPlayer({
  videoUrl,
  title = 'Конкурсное выступление',
  participantCode,
  isBlindMode = false,
  className = '',
}: ProtectedVideoPlayerProps) {
  const [isAudioOnly, setIsAudioOnly] = useState<boolean>(isBlindMode);
  const [hasError, setHasError] = useState<boolean>(false);

  // Parse embed URL from various video services
  const embedInfo = useMemo(() => {
    if (!videoUrl) return { type: 'unknown', url: '' };

    try {
      // YouTube
      const ytMatch = videoUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      if (ytMatch && ytMatch[1]) {
        return {
          type: 'youtube',
          url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&enablejsapi=1`,
        };
      }

      // Rutube
      const rutubeMatch = videoUrl.match(/rutube\.ru\/(?:video|play\/embed)\/([a-zA-Z0-9]+)/);
      if (rutubeMatch && rutubeMatch[1]) {
        return {
          type: 'rutube',
          url: `https://rutube.ru/play/embed/${rutubeMatch[1]}/`,
        };
      }

      // VK Video
      const vkMatch = videoUrl.match(/vk\.com\/video_ext\.php\?oid=([-\d]+)&id=([\d]+)/);
      if (vkMatch) {
        return {
          type: 'vk',
          url: videoUrl,
        };
      }

      // Direct video file (mp4, webm) or custom link
      if (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm')) {
        return {
          type: 'direct',
          url: videoUrl,
        };
      }

      return {
        type: 'iframe',
        url: videoUrl,
      };
    } catch {
      return { type: 'unknown', url: videoUrl };
    }
  }, [videoUrl]);

  return (
    <div
      className={`relative rounded-[10px] bg-[#040407] border border-[#4f4f80] shadow-[0_24px_64px_rgba(0,0,0,0.75),0_0_0_1px_rgba(79,79,128,0.3)] overflow-hidden font-sans ${className}`}
    >
      {/* Top Protection Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#08080c] border-b border-[#2a2a32] text-xs">
        <div className="flex items-center gap-2 text-[#a3a3b3]">
          <ShieldCheck className="w-4 h-4 text-[#6199f6]" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#dedfee]">
            {participantCode ? `ENTRY // ${participantCode}` : 'PROTECTED MEDIA'}
          </span>
          <span className="text-[#757580] hidden sm:inline">• Защищённый просмотр жюри</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle blind listening / audio only */}
          <button
            type="button"
            onClick={() => setIsAudioOnly(!isAudioOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isAudioOnly
                ? 'bg-[#6199f6] text-[#0a0a13]'
                : 'bg-[#181826] text-[#dedfee] hover:bg-[#2a2a32] border border-[#4f4f80]'
            }`}
            title="Режим слепого прослушивания (скрыть видео)"
          >
            {isAudioOnly ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Слепое прослушивание: ВКЛ</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Скрыть видеоряд</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative aspect-video w-full bg-[#000000] flex items-center justify-center overflow-hidden">
        {hasError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-[#ef4444]">
            <AlertCircle className="w-10 h-10 mb-2 opacity-80" />
            <p className="text-sm font-medium">Не удалось загрузить видео</p>
            <p className="text-xs text-[#757580] mt-1 mb-4">
              Возможно, видео имеет ограниченный доступ или ссылка устарела.
            </p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#6199f6] hover:underline"
            >
              <span>Открыть прямую ссылку</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : isAudioOnly ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a13] to-[#040407] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(97,153,246,0.12)] border border-[#6199f6] flex items-center justify-center mb-4 text-[#6199f6] animate-pulse">
              <EyeOff className="w-8 h-8" />
            </div>
            <h4 className="text-base font-medium text-[#fcfcfc] mb-1">
              Режим объективного оценивания
            </h4>
            <p className="text-xs text-[#a3a3b3] max-w-md mb-4">
              Видеоряд скрыт для исключения визуальной предвзятости. Оценивайте технику, интонацию и вокальное мастерство только на слух.
            </p>
            <button
              type="button"
              onClick={() => setIsAudioOnly(false)}
              className="text-xs text-[#6199f6] hover:underline flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Показать видеоряд</span>
            </button>
          </div>
        ) : embedInfo.type === 'direct' ? (
          <video
            src={embedInfo.url}
            controls
            controlsList="nodownload"
            className="w-full h-full object-contain"
            onError={() => setHasError(true)}
          />
        ) : embedInfo.url ? (
          <iframe
            src={embedInfo.url}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="text-xs text-[#757580]">Видео недоступно</div>
        )}

        {/* Dynamic Security Watermark */}
        <div className="absolute bottom-3 right-3 pointer-events-none select-none opacity-40 text-[10px] font-mono text-[#dedfee] bg-[#000000]/60 px-2 py-0.5 rounded border border-[#2a2a32]">
          espressivo ART • Private Stream {participantCode ? `• ${participantCode}` : ''}
        </div>
      </div>

      {/* Footer Info / Controls */}
      <div className="px-4 py-2 bg-[#08080c] border-t border-[#2a2a32] flex items-center justify-between text-xs text-[#757580]">
        <div className="truncate max-w-[70%] font-medium text-[#a3a3b3]">{title}</div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="text-[11px] font-mono text-[#22c55e]">HD 1080p Stream</span>
        </div>
      </div>
    </div>
  );
}
