'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/constants/roles';
import type { MemberListItem } from '@/lib/dashboard/queries';

const ASSIGNABLE_ROLES = [ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER] as const;

interface MembersListProps {
  members: MemberListItem[];
  currentUserId: string;
  canManage: boolean;
}

export function MembersList({ members, currentUserId, canManage }: MembersListProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  if (members.length === 0) {
    return <EmptyState title="No members found" description="Your organization has no members." />;
  }

  async function changeRole(userId: string, role: Role) {
    setError(null);
    setLoadingUserId(userId);
    try {
      const res = await fetch(`/api/organizations/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to update role');
        return;
      }
      router.refresh();
    } catch {
      setError('Failed to update role');
    } finally {
      setLoadingUserId(null);
    }
  }

  async function removeMember(userId: string, name: string) {
    if (!confirm(`Remove ${name} from this organization?`)) return;

    setError(null);
    setLoadingUserId(userId);
    try {
      const res = await fetch(`/api/organizations/members/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to remove member');
        return;
      }
      router.refresh();
    } catch {
      setError('Failed to remove member');
    } finally {
      setLoadingUserId(null);
    }
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <ul className="divide-y">
        {members.map((m) => {
          const isSuperAdmin = m.role === ROLES.SUPER_ADMIN;
          const isSelf = m.userId === currentUserId;
          const isLoading = loadingUserId === m.userId;
          const showActions = canManage && !isSuperAdmin;

          return (
            <li
              key={m.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {m.name}
                  {isSelf && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{m.email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {showActions ? (
                  <>
                    <select
                      className="flex h-9 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                      value={m.role}
                      disabled={isLoading}
                      onChange={(e) => changeRole(m.userId, e.target.value as Role)}
                    >
                      {ASSIGNABLE_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading || isSelf}
                      title={isSelf ? 'You cannot remove yourself' : undefined}
                      onClick={() => removeMember(m.userId, m.name)}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary">{ROLE_LABELS[m.role]}</Badge>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {canManage && (
        <p className="mt-4 text-xs text-muted-foreground">
          Super Admins cannot be modified. You cannot remove your own account.
        </p>
      )}
    </div>
  );
}
