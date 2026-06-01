import { DashboardShell } from '@/components/layout/dashboard-shell';
import { OrganizationSettingsForm } from '@/features/organization/components/organization-settings-form';
import { getAuthContext } from '@/lib/auth/session';
import { ROLES } from '@/lib/constants/roles';

export default async function SettingsPage() {
  const { role } = await getAuthContext();
  const canEdit = role === ROLES.SUPER_ADMIN;

  return (
    <DashboardShell title="Settings">
      <OrganizationSettingsForm canEdit={canEdit} />
    </DashboardShell>
  );
}
