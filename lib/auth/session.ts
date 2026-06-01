import { getServerSession } from 'next-auth';
import { authOptions } from './options';
import { connectDB } from '@/lib/db';
import { organizationMemberRepository } from '@/server/repositories/organization-member.repository';
import { UnauthorizedError } from '@/server/middleware/rbac.middleware';
import { type Role } from '@/lib/constants/roles';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function getAuthContext() {
  const session = await requireSession();
  await connectDB();

  const organizationId = session.user.organizationId;
  if (!organizationId) {
    throw new UnauthorizedError('No organization context');
  }

  let role = session.user.role as Role | undefined;
  const member = await organizationMemberRepository.findByOrgAndUser(
    organizationId,
    session.user.id,
  );
  role = member?.role ?? role;

  if (!role) {
    throw new UnauthorizedError('No role assigned');
  }

  return {
    session,
    userId: session.user.id,
    organizationId,
    role,
  };
}
