import { OrganizationMember, type IOrganizationMember } from '@/models/organization-member.model';
import { type Role } from '@/lib/constants/roles';

export class OrganizationMemberRepository {
  async findByOrgAndUser(
    organizationId: string,
    userId: string,
  ): Promise<IOrganizationMember | null> {
    return OrganizationMember.findOne({ organizationId, userId });
  }

  async findByOrganization(organizationId: string): Promise<IOrganizationMember[]> {
    return OrganizationMember.find({ organizationId }).populate('userId', 'name email image');
  }

  async create(data: {
    organizationId: string;
    userId: string;
    role: Role;
    invitedBy?: string;
  }): Promise<IOrganizationMember> {
    return OrganizationMember.create({
      organizationId: data.organizationId,
      userId: data.userId,
      role: data.role,
      invitedBy: data.invitedBy,
      joinedAt: new Date(),
    });
  }

  async updateRole(
    organizationId: string,
    userId: string,
    role: Role,
  ): Promise<IOrganizationMember | null> {
    return OrganizationMember.findOneAndUpdate({ organizationId, userId }, { role }, { new: true });
  }

  async remove(organizationId: string, userId: string): Promise<void> {
    const member = await OrganizationMember.findOne({ organizationId, userId });
    if (member) {
      member.deletedAt = new Date();
      await member.save();
    }
  }
}

export const organizationMemberRepository = new OrganizationMemberRepository();
