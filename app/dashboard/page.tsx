import { DashboardShell } from '@/components/layout/dashboard-shell';
import { OverviewStats } from '@/features/dashboard/components/overview-stats';
import { RecentProjects } from '@/features/dashboard/components/recent-projects';
import { getOrganizationStats, getRecentProjects } from '@/lib/dashboard/queries';

export default async function DashboardOverviewPage() {
  const [stats, recentProjects] = await Promise.all([getOrganizationStats(), getRecentProjects()]);

  return (
    <DashboardShell title="Overview">
      <OverviewStats stats={stats} />
      <RecentProjects projects={recentProjects} />
    </DashboardShell>
  );
}
