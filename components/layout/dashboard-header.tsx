'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({ title, onMenuClick }: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {session?.user?.email}
        </span>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
