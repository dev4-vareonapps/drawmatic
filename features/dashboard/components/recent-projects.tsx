import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { ProjectWithDiagramCount } from '@/lib/dashboard/queries';

interface RecentProjectsProps {
  projects: ProjectWithDiagramCount[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <EmptyState title="No projects yet" description="Projects you create will appear here." />
        ) : (
          <ul className="divide-y">
            {projects.map((p) => (
              <li key={p.id} className="flex justify-between py-3">
                <span className="font-medium">{p.name}</span>
                <span className="text-sm text-muted-foreground">
                  {p.diagramCount} {p.diagramCount === 1 ? 'diagram' : 'diagrams'} ·{' '}
                  {p.updatedAt.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
