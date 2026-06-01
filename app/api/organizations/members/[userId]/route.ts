import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { organizationService } from '@/server/services/organization.service';
import { updateMemberRoleSchema } from '@/schemas/organization.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';
import { ForbiddenError, UnauthorizedError } from '@/server/middleware/rbac.middleware';

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: targetUserId } = await params;
    const { organizationId, role } = await getAuthContext();
    const body = await request.json();
    const parsed = updateMemberRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const member = await organizationService.updateMemberRole(
      organizationId,
      role,
      targetUserId,
      parsed.data.role,
    );
    return NextResponse.json(member);
  } catch (error) {
    if (
      error instanceof Error &&
      !(error instanceof UnauthorizedError) &&
      !(error instanceof ForbiddenError)
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId: targetUserId } = await params;
    const { organizationId, role } = await getAuthContext();
    await organizationService.removeMember(organizationId, role, targetUserId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Error &&
      !(error instanceof UnauthorizedError) &&
      !(error instanceof ForbiddenError)
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
