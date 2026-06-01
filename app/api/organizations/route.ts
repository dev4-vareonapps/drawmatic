import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { organizationService } from '@/server/services/organization.service';
import { updateOrganizationSchema } from '@/schemas/organization.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';
import { ForbiddenError, UnauthorizedError } from '@/server/middleware/rbac.middleware';

export async function GET() {
  try {
    const { organizationId } = await getAuthContext();
    const org = await organizationService.getProfile(organizationId);
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    return NextResponse.json(org);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { organizationId, role } = await getAuthContext();
    const body = await request.json();
    const parsed = updateOrganizationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const org = await organizationService.updateSettings(organizationId, role, parsed.data);
    return NextResponse.json(org);
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
