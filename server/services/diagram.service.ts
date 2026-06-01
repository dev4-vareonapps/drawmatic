import { type Role } from '@/lib/constants/roles';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { requirePermission } from '@/server/middleware/rbac.middleware';
import { diagramRepository } from '@/server/repositories/diagram.repository';
import { folderService } from '@/server/services/folder.service';
import type { CreateDiagramInput, UpdateDiagramInput } from '@/schemas/diagram.schema';

export class DiagramService {
  async list(
    organizationId: string,
    role: Role,
    options?: { archived?: boolean; projectId?: string; folderId?: string },
  ) {
    requirePermission(role, PERMISSIONS.DIAGRAM_VIEW);
    return diagramRepository.findByOrganization(organizationId, options);
  }

  async getById(organizationId: string, role: Role, diagramId: string) {
    requirePermission(role, PERMISSIONS.DIAGRAM_VIEW);
    const diagram = await diagramRepository.findById(organizationId, diagramId);
    if (!diagram) {
      throw new Error('Diagram not found');
    }
    return diagram;
  }

  async create(organizationId: string, role: Role, userId: string, input: CreateDiagramInput) {
    requirePermission(role, PERMISSIONS.DIAGRAM_CREATE);

    const resolved = await folderService.validateForDiagram(
      organizationId,
      input.projectId,
      input.folderId,
    );

    return diagramRepository.create(organizationId, {
      ...input,
      projectId: resolved.projectId || input.projectId,
      folderId: resolved.folderId ?? input.folderId,
      createdBy: userId,
    });
  }

  async update(
    organizationId: string,
    role: Role,
    userId: string,
    diagramId: string,
    input: UpdateDiagramInput,
  ) {
    requirePermission(role, PERMISSIONS.DIAGRAM_EDIT);
    const diagram = await diagramRepository.update(organizationId, diagramId, {
      ...input,
      updatedBy: userId,
    });
    if (!diagram) {
      throw new Error('Diagram not found');
    }
    return diagram;
  }

  async delete(organizationId: string, role: Role, diagramId: string) {
    requirePermission(role, PERMISSIONS.DIAGRAM_DELETE);
    await diagramRepository.softDelete(organizationId, diagramId);
  }

  async duplicate(organizationId: string, role: Role, userId: string, diagramId: string) {
    requirePermission(role, PERMISSIONS.DIAGRAM_CREATE);
    const copy = await diagramRepository.duplicate(organizationId, diagramId, userId);
    if (!copy) {
      throw new Error('Diagram not found');
    }
    return copy;
  }

  async archive(organizationId: string, role: Role, userId: string, diagramId: string) {
    requirePermission(role, PERMISSIONS.DIAGRAM_EDIT);
    return diagramRepository.update(organizationId, diagramId, {
      archived: true,
      updatedBy: userId,
    });
  }

  async unarchive(organizationId: string, role: Role, userId: string, diagramId: string) {
    requirePermission(role, PERMISSIONS.DIAGRAM_EDIT);
    return diagramRepository.update(organizationId, diagramId, {
      archived: false,
      updatedBy: userId,
    });
  }
}

export const diagramService = new DiagramService();
