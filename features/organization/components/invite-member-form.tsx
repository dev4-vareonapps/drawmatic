'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROLES } from '@/lib/constants/roles';

interface InviteMemberFormProps {
  onSuccess?: () => void;
}

export function InviteMemberForm({ onSuccess }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.EDITOR);
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/organizations/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Invitation sent. Token: ${data.token}`);
      setEmail('');
      onSuccess?.();
    } else {
      setMessage(data.error ?? 'Failed to send invitation');
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label htmlFor="inviteEmail">Email</Label>
        <Input
          id="inviteEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inviteRole">Role</Label>
        <select
          id="inviteRole"
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
        >
          <option value={ROLES.ADMIN}>Admin</option>
          <option value={ROLES.EDITOR}>Editor</option>
          <option value={ROLES.VIEWER}>Viewer</option>
        </select>
      </div>
      <Button type="submit">Send invite</Button>
      {message && <p className="w-full text-sm text-muted-foreground">{message}</p>}
    </form>
  );
}
