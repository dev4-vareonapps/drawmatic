'use client';

import { useState } from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardHeader } from './dashboard-header';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardShell({ title, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform md:relative md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <DashboardSidebar />
      </div>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="flex flex-1 flex-col">
        <DashboardHeader title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
