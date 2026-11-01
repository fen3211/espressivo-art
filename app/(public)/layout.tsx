import React from 'react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="art"
      className="theme-art min-h-screen flex flex-col bg-[#e7e7e7] text-[#000000] font-serif selection:bg-[#000000] selection:text-[#ffffff]"
    >
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
