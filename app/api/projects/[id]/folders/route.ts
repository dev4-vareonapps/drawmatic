import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { folderService } from '@/server/services/folder.service';
import { createFolderSchema } from '@/schemas/folder.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';
import { ForbiddenError, UnauthorizedError } from '@/server/middleware/rbac.middleware';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const { organizationId } = await getAuthContext();
    const folders = await folderService.list(organizationId, projectId);
    return NextResponse.json(folders);
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const { organizationId, role, userId } = await getAuthContext();
    const body = await request.json();
    const parsed = createFolderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const folder = await folderService.create(organizationId, projectId, role, userId, parsed.data);
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof UnauthorizedError) {
      return apiErrorResponse(error);
    }
    if (error instanceof Error) {
      const status = error.message === 'Project not found' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return apiErrorResponse(error);
  }
}
