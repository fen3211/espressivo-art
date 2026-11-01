'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  theme?: 'art' | 'cinema';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, theme = 'cinema', className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    if (theme === 'art') {
      return (
        <div className="w-full flex flex-col gap-1.5 font-sans">
          {label && (
            <label htmlFor={inputId} className="text-[10px] uppercase font-bold tracking-[0.038em] text-[#000000]">
              {label}
            </label>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-11 px-3 bg-[#e7e7e7] text-[#000000] border-b-2 border-[#000000] focus:outline-none focus:bg-[#dedede] placeholder:text-[#757580] transition-colors rounded-none font-serif text-base ${
              error ? 'border-red-600' : 'border-[#000000]'
            } ${className}`}
            {...props}
          />
          {error && <span className="text-xs text-red-600 font-sans">{error}</span>}
          {helperText && !error && <span className="text-xs text-[#757580] font-sans">{helperText}</span>}
        </div>
      );
    }

    // Cinema Theme Input
    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#a3a3b3]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full h-10 px-3.5 bg-[#08080c] text-[#fcfcfc] border border-[#2a2a32] rounded-[8px] focus:outline-none focus:border-[#6199f6] focus:ring-1 focus:ring-[#6199f6] placeholder:text-[#757580] text-sm transition-all duration-150 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'hover:border-[#4f4f80]'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
        {helperText && !error && <span className="text-xs text-[#757580]">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
