import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { diagramService } from '@/server/services/diagram.service';
import { apiErrorResponse } from '@/server/middleware/api-handler';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId, role, userId } = await getAuthContext();
    const diagram = await diagramService.duplicate(organizationId, role, userId, id);
    return NextResponse.json(diagram, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
