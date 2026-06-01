import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { diagramService } from '@/server/services/diagram.service';
import { updateDiagramSchema } from '@/schemas/diagram.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId, role } = await getAuthContext();
    const diagram = await diagramService.getById(organizationId, role, id);
    return NextResponse.json(diagram);
  } catch (error) {
    if (error instanceof Error && error.message === 'Diagram not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId, role, userId } = await getAuthContext();
    const body = await request.json();
    const parsed = updateDiagramSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const diagram = await diagramService.update(organizationId, role, userId, id, parsed.data);
    return NextResponse.json(diagram);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId, role } = await getAuthContext();
    await diagramService.delete(organizationId, role, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
