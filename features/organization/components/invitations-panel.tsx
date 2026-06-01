'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InviteMemberForm } from './invite-member-form';
import { InvitationsList } from './invitations-list';

export function InvitationsPanel() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invite member</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteMemberForm onSuccess={() => setRefreshTrigger((n) => n + 1)} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationsList refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </>
  );
}
