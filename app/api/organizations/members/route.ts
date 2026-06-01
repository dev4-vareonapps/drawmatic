import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { organizationService } from '@/server/services/organization.service';
import { apiErrorResponse } from '@/server/middleware/api-handler';

export async function GET() {
  try {
    const { organizationId, role } = await getAuthContext();
    const members = await organizationService.getMembers(organizationId, role);
    return NextResponse.json(members);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
