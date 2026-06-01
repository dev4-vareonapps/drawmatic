import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { projectService } from '@/server/services/project.service';
import { updateProjectSchema } from '@/schemas/project.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';
import { ForbiddenError, UnauthorizedError } from '@/server/middleware/rbac.middleware';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId } = await getAuthContext();
    const project = await projectService.getById(organizationId, id);
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
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
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const project = await projectService.update(organizationId, role, userId, id, parsed.data);
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof UnauthorizedError) {
      return apiErrorResponse(error);
    }
    if (error instanceof Error && error.message === 'Project not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { organizationId, role } = await getAuthContext();
    await projectService.delete(organizationId, role, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof UnauthorizedError) {
      return apiErrorResponse(error);
    }
    if (error instanceof Error && error.message === 'Project not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
