import { Diagram } from '@/models/diagram.model';
import { OrganizationMember } from '@/models/organization-member.model';
import { Invitation } from '@/models/invitation.model';
import { User } from '@/models/user.model';
import { assertValidOrganizationId, withTenantFilter } from '@/server/middleware/tenant.middleware';
import {
  projectRepository,
  type ProjectWithDiagramCount,
} from '@/server/repositories/project.repository';
import { diagramRepository } from '@/server/repositories/diagram.repository';
import { type Role } from '@/lib/constants/roles';
import type { IDiagram } from '@/models/diagram.model';

export interface OrganizationStats {
  projects: number;
  diagrams: number;
  members: number;
  pendingInvitations: number;
}

export interface MemberListItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: Date;
}

export interface InvitationListItem {
  id: string;
  email: string;
  role: Role;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface DiagramListItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  archived: boolean;
  updatedAt: Date;
}

export class DashboardService {
  async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
    const orgId = assertValidOrganizationId(organizationId);

    const [projects, diagrams, members, pendingInvitations] = await Promise.all([
      projectRepository.countByOrganization(organizationId),
      Diagram.countDocuments(withTenantFilter(orgId)),
      OrganizationMember.countDocuments({ organizationId: orgId, deletedAt: null }),
      Invitation.countDocuments({
        organizationId: orgId,
        status: 'pending',
        deletedAt: null,
      }),
    ]);

    return { projects, diagrams, members, pendingInvitations };
  }

  async getRecentProjects(organizationId: string, limit = 5): Promise<ProjectWithDiagramCount[]> {
    return projectRepository.findRecentWithDiagramCounts(organizationId, limit);
  }

  async getProjects(organizationId: string): Promise<ProjectWithDiagramCount[]> {
    return projectRepository.findAllWithDiagramCounts(organizationId);
  }

  async getMembers(organizationId: string): Promise<MemberListItem[]> {
    const orgId = assertValidOrganizationId(organizationId);
    const members = await OrganizationMember.find({ organizationId: orgId, deletedAt: null })
      .sort({ joinedAt: 1 })
      .lean();

    const items: MemberListItem[] = [];
    for (const member of members) {
      const user = await User.findById(member.userId).select('name email').lean();
      if (!user) continue;
      items.push({
        id: member._id.toString(),
        userId: member.userId.toString(),
        name: user.name,
        email: user.email,
        role: member.role as Role,
        joinedAt: member.joinedAt,
      });
    }
    return items;
  }

  async getPendingInvitations(organizationId: string): Promise<InvitationListItem[]> {
    const orgId = assertValidOrganizationId(organizationId);
    const invitations = await Invitation.find({
      organizationId: orgId,
      status: 'pending',
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .lean();

    return invitations.map((inv) => ({
      id: inv._id.toString(),
      email: inv.email,
      role: inv.role as Role,
      status: inv.status,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
    }));
  }

  async getDiagrams(organizationId: string, archived = false): Promise<DiagramListItem[]> {
    const diagrams = await diagramRepository.findByOrganization(organizationId, { archived });
    return diagrams.map((d) => this.toDiagramListItem(d));
  }

  private toDiagramListItem(d: IDiagram): DiagramListItem {
    return {
      id: d._id.toString(),
      name: d.name,
      description: d.description ?? '',
      tags: d.tags ?? [],
      archived: d.archived,
      updatedAt: d.updatedAt,
    };
  }
}

export const dashboardService = new DashboardService();
