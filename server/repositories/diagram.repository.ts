import mongoose from 'mongoose';
import { Diagram, type IDiagram, type EditorMode } from '@/models/diagram.model';
import { withTenantFilter, assertValidOrganizationId } from '@/server/middleware/tenant.middleware';

export class DiagramRepository {
  async findByOrganization(
    organizationId: string,
    options?: { archived?: boolean; projectId?: string; folderId?: string },
  ): Promise<IDiagram[]> {
    const orgId = assertValidOrganizationId(organizationId);
    const filter: Record<string, unknown> = {};
    if (options?.archived !== undefined) filter.archived = options.archived;
    if (options?.projectId) filter.projectId = new mongoose.Types.ObjectId(options.projectId);
    if (options?.folderId) filter.folderId = new mongoose.Types.ObjectId(options.folderId);
    return Diagram.find(withTenantFilter(orgId, filter)).sort({ updatedAt: -1 });
  }

  async findById(organizationId: string, diagramId: string): Promise<IDiagram | null> {
    const orgId = assertValidOrganizationId(organizationId);
    return Diagram.findOne(
      withTenantFilter(orgId, { _id: new mongoose.Types.ObjectId(diagramId) }),
    );
  }

  async create(
    organizationId: string,
    data: {
      name: string;
      description?: string;
      projectId?: string;
      folderId?: string;
      xmlContent?: string;
      textContent?: string;
      tags?: string[];
      editorMode?: EditorMode;
      createdBy: string;
    },
  ): Promise<IDiagram> {
    const orgId = assertValidOrganizationId(organizationId);
    return Diagram.create({
      organizationId: orgId,
      name: data.name,
      description: data.description ?? '',
      projectId: data.projectId,
      folderId: data.folderId,
      xmlContent: data.xmlContent ?? '',
      textContent: data.textContent ?? '',
      tags: data.tags ?? [],
      editorMode: data.editorMode ?? 'text',
      version: 1,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    });
  }

  async update(
    organizationId: string,
    diagramId: string,
    data: Partial<{
      name: string;
      description: string;
      xmlContent: string;
      textContent: string;
      tags: string[];
      editorMode: EditorMode;
      archived: boolean;
      updatedBy: string;
    }>,
  ): Promise<IDiagram | null> {
    const orgId = assertValidOrganizationId(organizationId);
    const update: Record<string, unknown> = { ...data };
    if (data.xmlContent !== undefined || data.textContent !== undefined) {
      const existing = await this.findById(organizationId, diagramId);
      if (existing) {
        update.version = existing.version + 1;
      }
    }
    if (data.archived === true) {
      update.archivedAt = new Date();
    } else if (data.archived === false) {
      update.archivedAt = null;
    }
    return Diagram.findOneAndUpdate(
      withTenantFilter(orgId, { _id: new mongoose.Types.ObjectId(diagramId) }),
      update,
      { new: true },
    );
  }

  async softDelete(organizationId: string, diagramId: string): Promise<void> {
    const diagram = await this.findById(organizationId, diagramId);
    if (diagram) {
      diagram.deletedAt = new Date();
      await diagram.save();
    }
  }

  async duplicate(
    organizationId: string,
    diagramId: string,
    userId: string,
  ): Promise<IDiagram | null> {
    const source = await this.findById(organizationId, diagramId);
    if (!source) return null;
    return this.create(organizationId, {
      name: `${source.name} (Copy)`,
      description: source.description,
      projectId: source.projectId?.toString(),
      folderId: source.folderId?.toString(),
      xmlContent: source.xmlContent,
      textContent: source.textContent,
      tags: [...source.tags],
      editorMode: source.editorMode,
      createdBy: userId,
    });
  }
}

export const diagramRepository = new DiagramRepository();
