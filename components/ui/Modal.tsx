'use client';

import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  theme?: 'art' | 'cinema';
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  theme = 'cinema',
  children,
  footer,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  }[maxWidth];

  if (theme === 'art') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-none font-serif">
        <div
          className={`w-full ${maxWidthStyles} bg-[#e7e7e7] text-[#000000] border-2 border-[#000000] rounded-none p-6 shadow-none animate-in fade-in duration-150`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#000000]">
            <h3 className="text-xl font-normal font-serif tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="text-lg font-mono hover:opacity-60 cursor-pointer p-1"
              aria-label="Закрыть"
            >
              [✕]
            </button>
          </div>
          <div className="py-4 text-base font-art-body">{children}</div>
          {footer && (
            <div className="flex justify-end gap-3 pt-4 border-t border-[#000000]">{footer}</div>
          )}
        </div>
      </div>
    );
  }

  // Cinema Mode
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-sm font-sans">
      <div
        className={`w-full ${maxWidthStyles} rounded-[10px] bg-gradient-to-b from-[#181826] to-[#08080c] border border-[#4f4f80] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.85),0_0_0_1px_#4f4f80] text-[#fcfcfc] animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2a2a32]">
          <h3 className="text-lg font-medium text-[#fcfcfc]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#a3a3b3] hover:text-[#fcfcfc] hover:bg-[#2a2a32] transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        <div className="py-4 text-sm text-[#dedfee]">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a32]">{footer}</div>
        )}
      </div>
    </div>
  );
}
