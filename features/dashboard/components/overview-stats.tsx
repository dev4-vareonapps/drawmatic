import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrganizationStats } from '@/lib/dashboard/queries';

const STAT_CONFIG = [
  { key: 'projects' as const, label: 'Total Projects' },
  { key: 'diagrams' as const, label: 'Total Diagrams' },
  { key: 'members' as const, label: 'Total Members' },
  { key: 'pendingInvitations' as const, label: 'Pending Invitations' },
];

interface OverviewStatsProps {
  stats: OrganizationStats;
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map(({ key, label }) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
