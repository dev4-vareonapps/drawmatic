'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ROLE_LABELS, type Role } from '@/lib/constants/roles';

interface InvitationRecord {
  _id: string;
  email: string;
  role: Role;
  status: string;
  createdAt: string;
}

interface InvitationsListProps {
  refreshTrigger?: number;
}

function statusVariant(status: string): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'pending':
      return 'default';
    case 'accepted':
      return 'secondary';
    default:
      return 'outline';
  }
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

export function InvitationsList({ refreshTrigger = 0 }: InvitationsListProps) {
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/organizations/invitations');
      const data = await res.json();
      if (!res.ok) {
        setInvitations([]);
        setError(data.error ?? 'Failed to load invitations');
        return;
      }
      setInvitations(
        (data as InvitationRecord[]).map((inv) => ({
          _id: inv._id,
          email: inv.email,
          role: inv.role,
          status: inv.status,
          createdAt: inv.createdAt,
        })),
      );
    } catch {
      setError('Failed to load invitations');
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations, refreshTrigger]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading invitations...</p>;
  }

  if (error) {
    return <EmptyState title="Unable to load invitations" description={error} />;
  }

  if (invitations.length === 0) {
    return (
      <EmptyState
        title="No pending invitations"
        description="Invitations you send will appear here until they are accepted or revoked."
      />
    );
  }

  return (
    <ul className="divide-y">
      {invitations.map((inv) => (
        <li
          key={inv._id}
          className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-medium">{inv.email}</p>
            <p className="text-sm text-muted-foreground">
              Created {new Date(inv.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{ROLE_LABELS[inv.role]}</Badge>
            <Badge variant={statusVariant(inv.status)}>{formatStatus(inv.status)}</Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}
