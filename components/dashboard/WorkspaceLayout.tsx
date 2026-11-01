'use client';

import React, { useState } from 'react';
import { Sidebar, UserRole } from './Sidebar';
import { TopNav } from './TopNav';

export interface WorkspaceLayoutProps {
  role: UserRole;
  children: React.ReactNode;
  pageTitle?: string;
}

export function WorkspaceLayout({ role, children, pageTitle }: WorkspaceLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div
      data-theme="cinema"
      className="theme-cinema min-h-screen flex bg-[#0a0a13] text-[#fcfcfc] font-sans overflow-x-hidden"
    >
      {/* Sidebar (Desktop static + Mobile Drawer) */}
      <Sidebar
        role={role}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          role={role}
          pageTitle={pageTitle}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
