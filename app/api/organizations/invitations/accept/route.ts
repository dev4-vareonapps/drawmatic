import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import { organizationService } from '@/server/services/organization.service';
import { acceptInvitationSchema } from '@/schemas/organization.schema';
import { apiErrorResponse } from '@/server/middleware/api-handler';

export async function POST(request: Request) {
  try {
    const { userId, session } = await getAuthContext();
    const body = await request.json();
    const parsed = acceptInvitationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const invitation = await organizationService.acceptInvitation(
      parsed.data.token,
      userId,
      session.user.email!,
    );
    return NextResponse.json(invitation);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
