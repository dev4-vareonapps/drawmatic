import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { diagramService } from '@/server/services/diagram.service';
import { createDiagramSchema } from '@/schemas/diagram.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';

export async function GET(request: Request) {
  try {
    const { organizationId, role } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const archived = searchParams.get('archived') === 'true';
    const projectId = searchParams.get('projectId') ?? undefined;
    const folderId = searchParams.get('folderId') ?? undefined;
    const diagrams = await diagramService.list(organizationId, role, {
      archived,
      projectId,
      folderId,
    });
    return NextResponse.json(diagrams);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { organizationId, role, userId } = await getAuthContext();
    const body = await request.json();
    const parsed = createDiagramSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const diagram = await diagramService.create(organizationId, role, userId, parsed.data);
    return NextResponse.json(diagram, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
