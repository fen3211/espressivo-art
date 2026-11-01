'use client';

import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  theme?: 'art' | 'cinema';
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyText?: string;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  theme = 'cinema',
  onRowClick,
  isLoading = false,
  emptyText = 'Нет данных для отображения',
  className = '',
}: TableProps<T>) {
  if (theme === 'art') {
    return (
      <div className={`w-full overflow-x-auto border border-[#000000] rounded-none ${className}`}>
        <table className="w-full text-left border-collapse font-serif">
          <thead>
            <tr className="border-b border-[#000000] bg-transparent">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`p-3 text-[10px] font-sans font-bold uppercase tracking-[0.038em] text-[#000000] ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm font-sans text-[#757580]">
                  Загрузка...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm font-sans text-[#757580]">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-[#000000] last:border-b-0 text-base text-[#000000] ${
                    onRowClick ? 'hover:bg-[#dedede] cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-3.5 ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Cinema Mode
  return (
    <div
      className={`w-full overflow-x-auto rounded-[10px] border border-[#2a2a32] bg-[#08080c] shadow-[inset_0_0_0_1px_rgba(79,79,128,0.1)] ${className}`}
    >
      <table className="w-full text-left border-collapse font-sans text-sm">
        <thead>
          <tr className="border-b border-[#2a2a32] bg-[#040407] h-[42px]">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`px-4 text-xs font-medium uppercase tracking-wider text-[#a3a3b3] ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(42,42,50,0.6)]">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="p-10 text-center text-sm text-[#757580]">
                <div className="flex justify-center items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6199f6] animate-pulse" />
                  <span>Загрузка данных...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-10 text-center text-sm text-[#757580]">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(item)}
                className={`h-14 transition-colors duration-150 text-[#fcfcfc] ${
                  onRowClick
                    ? 'hover:bg-[rgba(79,79,128,0.18)] hover:border-l-2 hover:border-l-[#6199f6] cursor-pointer'
                    : 'hover:bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
