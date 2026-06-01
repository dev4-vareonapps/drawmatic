import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { folderService } from '@/server/services/folder.service';
import { updateFolderSchema } from '@/schemas/folder.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';
import { ForbiddenError, UnauthorizedError } from '@/server/middleware/rbac.middleware';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; folderId: string }> },
) {
  try {
    const { id: projectId, folderId } = await params;
    const { organizationId } = await getAuthContext();
    const folder = await folderService.getById(organizationId, projectId, folderId);
    return NextResponse.json(folder);
  } catch (error) {
    if (error instanceof Error && error.message === 'Folder not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return apiErrorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; folderId: string }> },
) {
  try {
    const { id: projectId, folderId } = await params;
    const { organizationId, role } = await getAuthContext();
    const body = await request.json();
    const parsed = updateFolderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const folder = await folderService.update(
      organizationId,
      projectId,
      role,
      folderId,
      parsed.data,
    );
    return NextResponse.json(folder);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof UnauthorizedError) {
      return apiErrorResponse(error);
    }
    if (error instanceof Error) {
      const status =
        error.message === 'Folder not found' || error.message === 'Project not found' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return apiErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; folderId: string }> },
) {
  try {
    const { id: projectId, folderId } = await params;
    const { organizationId, role } = await getAuthContext();
    await folderService.delete(organizationId, projectId, role, folderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof UnauthorizedError) {
      return apiErrorResponse(error);
    }
    if (error instanceof Error) {
      const status =
        error.message === 'Folder not found' || error.message === 'Project not found' ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return apiErrorResponse(error);
  }
}
