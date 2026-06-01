import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProjectsPanel } from '@/features/projects/components/projects-panel';
import { getAuthContext } from '@/lib/auth/session';
import { PERMISSIONS, roleHasPermission } from '@/lib/constants/permissions';

export default async function ProjectsPage() {
  const { role } = await getAuthContext();

  return (
    <DashboardShell title="Projects">
      <ProjectsPanel
        canCreate={roleHasPermission(role, PERMISSIONS.PROJECT_CREATE)}
        canEdit={roleHasPermission(role, PERMISSIONS.PROJECT_EDIT)}
        canDelete={roleHasPermission(role, PERMISSIONS.PROJECT_DELETE)}
      />
    </DashboardShell>
  );
}
