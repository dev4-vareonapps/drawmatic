import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/db';
import { type Role } from '@/lib/constants/roles';
import { authService } from '@/server/services/auth.service';
import { loginSchema } from '@/schemas/auth.schema';
import { organizationMemberRepository } from '@/server/repositories/organization-member.repository';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        await connectDB();
        const user = await authService.validateCredentials(parsed.data.email, parsed.data.password);
        if (!user) {
          return null;
        }

        let role: Role | undefined = user.role as Role | undefined;
        if (user.organizationId && !role) {
          const member = await organizationMemberRepository.findByOrgAndUser(
            user.organizationId,
            user.id,
          );
          role = member?.role;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          organizationId: user.organizationId,
          role: role as Role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.role = user.role;
      }
      if (trigger === 'update' && session) {
        const s = session as { organizationId?: string; role?: Role };
        token.organizationId = s.organizationId ?? token.organizationId;
        token.role = s.role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
