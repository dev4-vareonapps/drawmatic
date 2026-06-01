import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { organizationService } from '@/server/services/organization.service';
import { inviteMemberSchema } from '@/schemas/organization.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';

export async function GET() {
  try {
    const { organizationId, role } = await getAuthContext();
    const invitations = await organizationService.listInvitations(organizationId, role);
    return NextResponse.json(invitations);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { organizationId, userId, role } = await getAuthContext();
    const body = await request.json();
    const parsed = inviteMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const invitation = await organizationService.inviteMember(
      organizationId,
      userId,
      role,
      parsed.data,
    );
    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
