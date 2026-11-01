'use client';

import React from 'react';
import { WorkspaceLayout } from '@/components/dashboard/WorkspaceLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceLayout role="ADMIN" pageTitle="Панель супер-администратора (Control Core)">
      {children}
    </WorkspaceLayout>
  );
}
