import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { DiagramListItem } from '@/lib/dashboard/queries';
import { Plus } from 'lucide-react';

interface DiagramListProps {
  diagrams: DiagramListItem[];
}

export function DiagramList({ diagrams }: DiagramListProps) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button asChild>
          <Link href="/dashboard/diagrams/new">
            <Plus className="mr-2 h-4 w-4" />
            New Diagram
          </Link>
        </Button>
      </div>
      {diagrams.length === 0 ? (
        <EmptyState
          title="No diagrams yet"
          description="Create your first diagram to get started."
          action={
            <Button asChild>
              <Link href="/dashboard/diagrams/new">Create diagram</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {diagrams.map((d) => (
            <Card key={d.id} className={d.archived ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    <Link href={`/dashboard/diagrams/${d.id}`} className="hover:underline">
                      {d.name}
                    </Link>
                  </CardTitle>
                  {d.archived && <Badge variant="secondary">Archived</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                {d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}
                {d.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {d.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Updated {d.updatedAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
