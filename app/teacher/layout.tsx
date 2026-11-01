'use client';

import React from 'react';
import { WorkspaceLayout } from '@/components/dashboard/WorkspaceLayout';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceLayout role="TEACHER" pageTitle="Кабинет преподавателя (20% Royalty)">
      {children}
    </WorkspaceLayout>
  );
}
