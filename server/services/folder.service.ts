import { type Role } from '@/lib/constants/roles';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { requirePermission } from '@/server/middleware/rbac.middleware';
import { folderRepository, type FolderListItem } from '@/server/repositories/folder.repository';
import { projectRepository } from '@/server/repositories/project.repository';
import type { CreateFolderInput, UpdateFolderInput } from '@/schemas/folder.schema';

export class FolderService {
  private async assertProjectInOrg(organizationId: string, projectId: string) {
    const project = await projectRepository.findById(organizationId, projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async list(organizationId: string, projectId: string): Promise<FolderListItem[]> {
    await this.assertProjectInOrg(organizationId, projectId);
    return folderRepository.findAllWithCounts(organizationId, projectId);
  }

  async getById(organizationId: string, projectId: string, folderId: string) {
    await this.assertProjectInOrg(organizationId, projectId);
    const folder = await folderRepository.findById(organizationId, folderId);
    if (!folder || folder.projectId.toString() !== projectId) {
      throw new Error('Folder not found');
    }
    return folderRepository.toListItem(organizationId, folder);
  }

  async create(
    organizationId: string,
    projectId: string,
    role: Role,
    userId: string,
    input: CreateFolderInput,
  ) {
    requirePermission(role, PERMISSIONS.PROJECT_CREATE);
    await this.assertProjectInOrg(organizationId, projectId);
    const folder = await folderRepository.create(organizationId, projectId, {
      name: input.name,
      parentId: input.parentId ?? null,
      createdBy: userId,
    });
    return folderRepository.toListItem(organizationId, folder);
  }

  async update(
    organizationId: string,
    projectId: string,
    role: Role,
    folderId: string,
    input: UpdateFolderInput,
  ) {
    requirePermission(role, PERMISSIONS.PROJECT_EDIT);
    await this.assertProjectInOrg(organizationId, projectId);
    const folder = await folderRepository.update(organizationId, folderId, {
      name: input.name,
      parentId: input.parentId,
    });
    if (!folder || folder.projectId.toString() !== projectId) {
      throw new Error('Folder not found');
    }
    return folderRepository.toListItem(organizationId, folder);
  }

  async delete(organizationId: string, projectId: string, role: Role, folderId: string) {
    requirePermission(role, PERMISSIONS.PROJECT_DELETE);
    await this.assertProjectInOrg(organizationId, projectId);
    const folder = await folderRepository.findById(organizationId, folderId);
    if (!folder || folder.projectId.toString() !== projectId) {
      throw new Error('Folder not found');
    }
    await folderRepository.softDelete(organizationId, folderId);
  }

  async validateForDiagram(
    organizationId: string,
    projectId: string | undefined,
    folderId: string | undefined,
  ): Promise<{ projectId?: string; folderId?: string }> {
    if (!folderId) {
      if (projectId) {
        await this.assertProjectInOrg(organizationId, projectId);
        return { projectId };
      }
      return {};
    }

    const folder = await folderRepository.findById(organizationId, folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    const folderProjectId = folder.projectId.toString();
    if (projectId && projectId !== folderProjectId) {
      throw new Error('Folder does not belong to the specified project');
    }

    return { projectId: folderProjectId, folderId };
  }
}

export const folderService = new FolderService();
