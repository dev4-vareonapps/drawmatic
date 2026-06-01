import { getAuthContext } from '@/lib/auth/session';
import { dashboardService } from '@/server/services/dashboard.service';
import type { ProjectWithDiagramCount } from '@/server/repositories/project.repository';
import type {
  OrganizationStats,
  MemberListItem,
  InvitationListItem,
  DiagramListItem,
} from '@/server/services/dashboard.service';

export type {
  OrganizationStats,
  ProjectWithDiagramCount,
  MemberListItem,
  InvitationListItem,
  DiagramListItem,
};

export async function getOrganizationStats(): Promise<OrganizationStats> {
  const { organizationId } = await getAuthContext();
  return dashboardService.getOrganizationStats(organizationId);
}

export async function getRecentProjects(limit = 5): Promise<ProjectWithDiagramCount[]> {
  const { organizationId } = await getAuthContext();
  return dashboardService.getRecentProjects(organizationId, limit);
}

export async function getProjects(): Promise<ProjectWithDiagramCount[]> {
  const { organizationId } = await getAuthContext();
  return dashboardService.getProjects(organizationId);
}

export async function getMembers(): Promise<MemberListItem[]> {
  const { organizationId } = await getAuthContext();
  return dashboardService.getMembers(organizationId);
}

export async function getPendingInvitations(): Promise<InvitationListItem[]> {
  const { organizationId } = await getAuthContext();
  return dashboardService.getPendingInvitations(organizationId);
}

export async function getDiagrams(archived = false): Promise<DiagramListItem[]> {
  const { organizationId } = await getAuthContext();
  return dashboardService.getDiagrams(organizationId, archived);
}
