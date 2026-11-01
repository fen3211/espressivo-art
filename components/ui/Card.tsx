'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'art' | 'cinema';
  interactive?: boolean;
  hasGlow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  theme = 'cinema',
  interactive = false,
  hasGlow = false,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  let paddingStyles = '';
  switch (padding) {
    case 'none':
      paddingStyles = 'p-0';
      break;
    case 'sm':
      paddingStyles = 'p-4';
      break;
    case 'md':
      paddingStyles = 'p-6';
      break;
    case 'lg':
      paddingStyles = 'p-8';
      break;
  }

  if (theme === 'art') {
    return (
      <div
        className={`bg-[#e7e7e7] border border-[#000000] rounded-none ${paddingStyles} ${
          interactive ? 'hover:bg-[#dedede] cursor-pointer transition-colors duration-150' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Cinema Mode
  const interactiveStyles = interactive
    ? 'hover:border-[#6199f6] hover:shadow-[0_16px_36px_rgba(97,153,246,0.2),inset_0_0_0_1px_#6199f6] hover:-translate-y-1 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
    : 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]';

  const glowStyles = hasGlow
    ? 'shadow-[inset_0_0_0_1px_#4f4f80,0_12px_32px_rgba(79,79,128,0.25)] border-[#4f4f80]'
    : 'border-[#4f4f80] shadow-[inset_0_0_0_1px_rgba(79,79,128,0.15),0_8px_24px_rgba(0,0,0,0.45)]';

  return (
    <div
      className={`rounded-[10px] bg-gradient-to-b from-[rgba(24,24,38,0.7)] to-[rgba(8,8,12,0.9)] backdrop-blur-md border ${glowStyles} ${paddingStyles} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
