'use client';

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  theme?: 'art' | 'cinema';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, theme = 'cinema', className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    if (theme === 'art') {
      return (
        <div className="w-full flex flex-col gap-1.5 font-sans">
          {label && (
            <label htmlFor={selectId} className="text-[10px] uppercase font-bold tracking-[0.038em] text-[#000000]">
              {label}
            </label>
          )}
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-11 px-3 bg-[#e7e7e7] text-[#000000] border-b-2 border-[#000000] focus:outline-none focus:bg-[#dedede] rounded-none font-serif text-base cursor-pointer ${
              error ? 'border-red-600' : 'border-[#000000]'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#e7e7e7] text-[#000000]">
                {opt.label}
              </option>
            ))}
          </select>
          {error && <span className="text-xs text-red-600 font-sans">{error}</span>}
          {helperText && !error && <span className="text-xs text-[#757580] font-sans">{helperText}</span>}
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-[#a3a3b3]">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full h-10 px-3 bg-[#08080c] text-[#fcfcfc] border border-[#2a2a32] rounded-[8px] focus:outline-none focus:border-[#6199f6] focus:ring-1 focus:ring-[#6199f6] text-sm cursor-pointer transition-all ${
            error ? 'border-red-500' : 'hover:border-[#4f4f80]'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#08080c] text-[#fcfcfc]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-400">{error}</span>}
        {helperText && !error && <span className="text-xs text-[#757580]">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
