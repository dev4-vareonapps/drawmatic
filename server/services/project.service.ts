import { type Role } from '@/lib/constants/roles';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { requirePermission } from '@/server/middleware/rbac.middleware';
import {
  projectRepository,
  type ProjectWithDiagramCount,
} from '@/server/repositories/project.repository';
import type { CreateProjectInput, UpdateProjectInput } from '@/schemas/project.schema';

export class ProjectService {
  async list(organizationId: string): Promise<ProjectWithDiagramCount[]> {
    return projectRepository.findAllWithDiagramCounts(organizationId);
  }

  async getById(organizationId: string, projectId: string) {
    const project = await projectRepository.findById(organizationId, projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async create(organizationId: string, role: Role, userId: string, input: CreateProjectInput) {
    requirePermission(role, PERMISSIONS.PROJECT_CREATE);
    return projectRepository.create(organizationId, {
      name: input.name,
      description: input.description,
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async update(
    organizationId: string,
    role: Role,
    userId: string,
    projectId: string,
    input: UpdateProjectInput,
  ) {
    requirePermission(role, PERMISSIONS.PROJECT_EDIT);
    const project = await projectRepository.update(organizationId, projectId, {
      ...input,
      updatedBy: userId,
    });
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async delete(organizationId: string, role: Role, projectId: string) {
    requirePermission(role, PERMISSIONS.PROJECT_DELETE);
    const project = await projectRepository.findById(organizationId, projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    await projectRepository.softDelete(organizationId, projectId);
  }
}

export const projectService = new ProjectService();
