'use client';

import React from 'react';
import { WorkspaceLayout } from '@/components/dashboard/WorkspaceLayout';

export default function JuryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceLayout role="JURY" pageTitle="Судейский терминал (Adjudication Suite)">
      {children}
    </WorkspaceLayout>
  );
}
