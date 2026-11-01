'use client';

import React from 'react';
import { WorkspaceLayout } from '@/components/dashboard/WorkspaceLayout';

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceLayout role="PARTICIPANT" pageTitle="Личный кабинет участника">
      {children}
    </WorkspaceLayout>
  );
}
