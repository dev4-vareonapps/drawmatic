import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { projectService } from '@/server/services/project.service';
import { createProjectSchema } from '@/schemas/project.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';
import { ForbiddenError, UnauthorizedError } from '@/server/middleware/rbac.middleware';

export async function GET() {
  try {
    const { organizationId } = await getAuthContext();
    const projects = await projectService.list(organizationId);
    return NextResponse.json(projects);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { organizationId, role, userId } = await getAuthContext();
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const project = await projectService.create(organizationId, role, userId, parsed.data);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof UnauthorizedError) {
      return apiErrorResponse(error);
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
