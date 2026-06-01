import crypto from 'crypto';
import { ROLES, type Role } from '@/lib/constants/roles';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { ForbiddenError, requirePermission } from '@/server/middleware/rbac.middleware';
import { organizationRepository } from '@/server/repositories/organization.repository';
import { organizationMemberRepository } from '@/server/repositories/organization-member.repository';
import { invitationRepository } from '@/server/repositories/invitation.repository';
import { userRepository } from '@/server/repositories/user.repository';
import type { InviteMemberInput, UpdateOrganizationInput } from '@/schemas/organization.schema';

export class OrganizationService {
  async getProfile(organizationId: string) {
    return organizationRepository.findById(organizationId);
  }

  async updateSettings(organizationId: string, actorRole: Role, input: UpdateOrganizationInput) {
    if (actorRole !== ROLES.SUPER_ADMIN) {
      throw new ForbiddenError('Only Super Admin can update organization settings');
    }
    const { slug: _slug, ...allowed } = input;
    return organizationRepository.update(organizationId, allowed);
  }

  async getMembers(organizationId: string, actorRole: Role) {
    requirePermission(actorRole, PERMISSIONS.ORG_MANAGE_USERS);
    return organizationMemberRepository.findByOrganization(organizationId);
  }

  async inviteMember(
    organizationId: string,
    actorId: string,
    actorRole: Role,
    input: InviteMemberInput,
  ) {
    requirePermission(actorRole, PERMISSIONS.ORG_MANAGE_USERS);

    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      const member = await organizationMemberRepository.findByOrgAndUser(
        organizationId,
        existingUser._id.toString(),
      );
      if (member) {
        throw new Error('User is already a member');
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return invitationRepository.create({
      organizationId,
      email: input.email,
      role: input.role,
      token,
      invitedBy: actorId,
      expiresAt,
    });
  }

  async acceptInvitation(token: string, userId: string, userEmail: string) {
    const invitation = await invitationRepository.findByToken(token);
    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }
    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('Invitation email does not match your account');
    }

    const existing = await organizationMemberRepository.findByOrgAndUser(
      invitation.organizationId.toString(),
      userId,
    );
    if (existing) {
      throw new Error('Already a member of this organization');
    }

    await organizationMemberRepository.create({
      organizationId: invitation.organizationId.toString(),
      userId,
      role: invitation.role,
      invitedBy: invitation.invitedBy.toString(),
    });

    await invitationRepository.accept(invitation._id.toString());

    return invitation;
  }

  async updateMemberRole(
    organizationId: string,
    actorRole: Role,
    targetUserId: string,
    role: Role,
  ) {
    requirePermission(actorRole, PERMISSIONS.ORG_MANAGE_USERS);

    const target = await organizationMemberRepository.findByOrgAndUser(
      organizationId,
      targetUserId,
    );
    if (!target) {
      throw new Error('Member not found');
    }
    if (target.role === ROLES.SUPER_ADMIN) {
      throw new Error('Cannot change Super Admin role');
    }
    if (role === ROLES.SUPER_ADMIN) {
      throw new Error('Cannot assign Super Admin role via invite');
    }

    return organizationMemberRepository.updateRole(organizationId, targetUserId, role);
  }

  async removeMember(organizationId: string, actorRole: Role, targetUserId: string) {
    requirePermission(actorRole, PERMISSIONS.ORG_MANAGE_USERS);

    const target = await organizationMemberRepository.findByOrgAndUser(
      organizationId,
      targetUserId,
    );
    if (!target) {
      throw new Error('Member not found');
    }
    if (target.role === ROLES.SUPER_ADMIN) {
      throw new Error('Cannot remove Super Admin');
    }

    await organizationMemberRepository.remove(organizationId, targetUserId);
  }

  async listInvitations(organizationId: string, actorRole: Role) {
    requirePermission(actorRole, PERMISSIONS.ORG_MANAGE_USERS);
    return invitationRepository.findByOrganization(organizationId);
  }

  async revokeInvitation(organizationId: string, actorRole: Role, invitationId: string) {
    requirePermission(actorRole, PERMISSIONS.ORG_MANAGE_USERS);
    await invitationRepository.revoke(invitationId);
  }
}

export const organizationService = new OrganizationService();
