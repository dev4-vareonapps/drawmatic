import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PenTool } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <PenTool className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Drawmatic</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Diagram your ideas with clarity
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Multi-tenant SaaS for teams. Create diagrams with Mermaid text or draw.io visual editing.
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Start free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
