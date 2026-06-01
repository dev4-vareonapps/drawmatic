import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ROLES, type Role } from '@/lib/constants/roles';
import { slugify } from '@/lib/utils';
import { userRepository } from '@/server/repositories/user.repository';
import { organizationRepository } from '@/server/repositories/organization.repository';
import { organizationMemberRepository } from '@/server/repositories/organization-member.repository';
import { Subscription } from '@/models/subscription.model';
import type { RegisterInput } from '@/schemas/auth.schema';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const baseSlug = slugify(input.name) || 'org';
    let slug = baseSlug;
    let suffix = 0;
    while (await organizationRepository.findBySlug(slug)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const organization = await organizationRepository.create({
      name: `${input.name}'s Organization`,
      slug,
      ownerId: user._id.toString(),
      description: '',
    });

    await organizationMemberRepository.create({
      organizationId: organization._id.toString(),
      userId: user._id.toString(),
      role: ROLES.SUPER_ADMIN,
    });

    await Subscription.create({
      organizationId: organization._id,
      plan: 'free',
      status: 'active',
    });

    await userRepository.updateDefaultOrganization(
      user._id.toString(),
      organization._id.toString(),
    );

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      organization: {
        id: organization._id.toString(),
        name: organization.name,
        slug: organization.slug,
      },
    };
  }

  async validateCredentials(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user?.passwordHash) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return null;
    }

    let organizationId = user.defaultOrganizationId?.toString();
    let role: Role | undefined;

    if (organizationId) {
      const member = await organizationMemberRepository.findByOrgAndUser(
        organizationId,
        user._id.toString(),
      );
      role = member?.role;
    }

    if (!organizationId || !role) {
      const { OrganizationMember } = await import('@/models/organization-member.model');
      const firstMember = await OrganizationMember.findOne({ userId: user._id });
      if (firstMember) {
        organizationId = firstMember.organizationId.toString();
        role = firstMember.role;
      }
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      organizationId,
      role,
    };
  }
}

export const authService = new AuthService();
