import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MembersList } from '@/features/organization/components/members-list';
import { getMembers } from '@/lib/dashboard/queries';
import { getAuthContext } from '@/lib/auth/session';
import { PERMISSIONS, roleHasPermission } from '@/lib/constants/permissions';

export default async function MembersPage() {
  const [{ userId, role }, members] = await Promise.all([getAuthContext(), getMembers()]);

  const canManage = roleHasPermission(role, PERMISSIONS.ORG_MANAGE_USERS);

  return (
    <DashboardShell title="Members">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <MembersList members={members} currentUserId={userId} canManage={canManage} />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
