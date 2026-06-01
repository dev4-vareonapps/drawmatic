import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProjectDetailView } from '@/features/folders/components/project-detail-view';
import { getAuthContext } from '@/lib/auth/session';
import { PERMISSIONS, roleHasPermission } from '@/lib/constants/permissions';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { role } = await getAuthContext();

  return (
    <DashboardShell title="Project">
      <ProjectDetailView
        projectId={projectId}
        canCreateFolder={roleHasPermission(role, PERMISSIONS.PROJECT_CREATE)}
        canEditFolder={roleHasPermission(role, PERMISSIONS.PROJECT_EDIT)}
        canDeleteFolder={roleHasPermission(role, PERMISSIONS.PROJECT_DELETE)}
        canCreateDiagram={roleHasPermission(role, PERMISSIONS.DIAGRAM_CREATE)}
      />
    </DashboardShell>
  );
}
