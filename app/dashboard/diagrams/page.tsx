import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DiagramList } from '@/features/diagrams/components/diagram-list';
import { getDiagrams } from '@/lib/dashboard/queries';

export default async function DiagramsPage() {
  const diagrams = await getDiagrams(false);

  return (
    <DashboardShell title="Diagrams">
      <DiagramList diagrams={diagrams} />
    </DashboardShell>
  );
}
