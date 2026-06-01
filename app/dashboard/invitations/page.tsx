import { DashboardShell } from '@/components/layout/dashboard-shell';
import { InvitationsPanel } from '@/features/organization/components/invitations-panel';

export default function InvitationsPage() {
  return (
    <DashboardShell title="Invitations">
      <InvitationsPanel />
    </DashboardShell>
  );
}
