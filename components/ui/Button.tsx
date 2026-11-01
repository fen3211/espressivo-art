'use client';

import React from 'react';

export type ButtonVariant =
  | 'solid-ink'
  | 'outline-ink'
  | 'text-underline'
  | 'primary-vellum'
  | 'iris-action'
  | 'ghost'
  | 'danger-outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  variant = 'solid-ink',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base classes according to the variant family
  const isArt = variant === 'solid-ink' || variant === 'outline-ink' || variant === 'text-underline';

  let variantStyles = '';
  switch (variant) {
    case 'solid-ink':
      variantStyles = 'bg-[#000000] text-[#ffffff] border border-[#000000] hover:bg-[#121212] active:translate-y-[1px]';
      break;
    case 'outline-ink':
      variantStyles = 'bg-transparent text-[#000000] border border-[#000000] hover:bg-[#000000] hover:text-[#ffffff] active:translate-y-[1px]';
      break;
    case 'text-underline':
      variantStyles = 'bg-transparent text-[#000000] border-b border-transparent hover:border-[#000000] rounded-none';
      break;
    case 'primary-vellum':
      variantStyles = 'bg-[#fcfcfc] text-[#0a0a13] font-medium border-0 hover:bg-[#e0e0e0] active:scale-[0.98]';
      break;
    case 'iris-action':
      variantStyles = 'bg-[#6199f6] text-[#0a0a13] font-medium border-0 hover:bg-[#7db0ff] hover:shadow-[0_0_16px_rgba(97,153,246,0.4)] active:scale-[0.98]';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent text-[#fcfcfc] border border-[rgba(252,252,252,0.2)] hover:bg-[rgba(252,252,252,0.08)] hover:border-[#fcfcfc] active:scale-[0.98]';
      break;
    case 'danger-outline':
      variantStyles = 'bg-transparent text-[#ef4444] border border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.12)] hover:border-[#ef4444] active:scale-[0.98]';
      break;
  }

  let sizeStyles = '';
  if (isArt) {
    switch (size) {
      case 'sm':
        sizeStyles = 'h-9 px-4 text-[9px] tracking-[0.033em] uppercase';
        break;
      case 'md':
        sizeStyles = 'h-11 px-6 text-[10px] tracking-[0.033em] uppercase';
        break;
      case 'lg':
        sizeStyles = 'h-[52px] px-8 text-[11px] tracking-[0.033em] uppercase';
        break;
    }
  } else {
    // Cinema pill button
    switch (size) {
      case 'sm':
        sizeStyles = 'h-8 px-4 text-xs tracking-normal rounded-full';
        break;
      case 'md':
        sizeStyles = 'h-[42px] px-6 text-sm tracking-normal rounded-full';
        break;
      case 'lg':
        sizeStyles = 'h-[50px] px-7 text-[15px] tracking-normal rounded-full';
        break;
    }
  }

  const radiusStyles = isArt ? 'rounded-none' : 'rounded-full';

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-sans transition-all duration-150 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${radiusStyles} ${variantStyles} ${sizeStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Загрузка...</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          {iconLeft && <span className="shrink-0">{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </span>
      )}
    </button>
  );
}
