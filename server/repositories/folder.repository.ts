import mongoose from 'mongoose';
import { Folder, type IFolder } from '@/models/folder.model';
import { Diagram } from '@/models/diagram.model';
import { slugify } from '@/lib/utils';
import { withTenantFilter, assertValidOrganizationId } from '@/server/middleware/tenant.middleware';

export interface FolderListItem {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  path: string;
  diagramCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class FolderRepository {
  async findByProject(organizationId: string, projectId: string): Promise<IFolder[]> {
    const orgId = assertValidOrganizationId(organizationId);
    return Folder.find(
      withTenantFilter(orgId, {
        projectId: new mongoose.Types.ObjectId(projectId),
      }),
    ).sort({ path: 1 });
  }

  async findById(organizationId: string, folderId: string): Promise<IFolder | null> {
    const orgId = assertValidOrganizationId(organizationId);
    return Folder.findOne(withTenantFilter(orgId, { _id: new mongoose.Types.ObjectId(folderId) }));
  }

  async findByNameAndParent(
    organizationId: string,
    projectId: string,
    name: string,
    parentId: string | null,
  ): Promise<IFolder | null> {
    const orgId = assertValidOrganizationId(organizationId);
    return Folder.findOne(
      withTenantFilter(orgId, {
        projectId: new mongoose.Types.ObjectId(projectId),
        name: name.trim(),
        parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      }),
    );
  }

  private buildPathSegment(name: string): string {
    return slugify(name) || 'folder';
  }

  async buildPath(organizationId: string, name: string, parentId?: string | null): Promise<string> {
    const segment = this.buildPathSegment(name);
    if (!parentId) return `/${segment}`;

    const parent = await this.findById(organizationId, parentId);
    if (!parent) {
      throw new Error('Parent folder not found');
    }
    return `${parent.path}/${segment}`;
  }

  async create(
    organizationId: string,
    projectId: string,
    data: { name: string; parentId?: string | null; createdBy: string },
  ): Promise<IFolder> {
    const orgId = assertValidOrganizationId(organizationId);
    const parentId = data.parentId ?? null;

    const duplicate = await this.findByNameAndParent(
      organizationId,
      projectId,
      data.name,
      parentId,
    );
    if (duplicate) {
      throw new Error('A folder with this name already exists at this level');
    }

    if (parentId) {
      const parent = await this.findById(organizationId, parentId);
      if (!parent || parent.projectId.toString() !== projectId) {
        throw new Error('Parent folder not found in this project');
      }
    }

    const path = await this.buildPath(organizationId, data.name, parentId);

    return Folder.create({
      organizationId: orgId,
      projectId: new mongoose.Types.ObjectId(projectId),
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      name: data.name.trim(),
      path,
      createdBy: data.createdBy,
    });
  }

  async update(
    organizationId: string,
    folderId: string,
    data: Partial<{ name: string; parentId: string | null }>,
  ): Promise<IFolder | null> {
    const existing = await this.findById(organizationId, folderId);
    if (!existing) return null;

    const projectId = existing.projectId.toString();
    const parentId =
      data.parentId !== undefined ? data.parentId : (existing.parentId?.toString() ?? null);
    const name = data.name ?? existing.name;

    if (data.name || data.parentId !== undefined) {
      const duplicate = await this.findByNameAndParent(organizationId, projectId, name, parentId);
      if (duplicate && duplicate._id.toString() !== folderId) {
        throw new Error('A folder with this name already exists at this level');
      }
    }

    if (parentId) {
      const parent = await this.findById(organizationId, parentId);
      if (!parent || parent.projectId.toString() !== projectId) {
        throw new Error('Parent folder not found in this project');
      }
      if (parentId === folderId) {
        throw new Error('Folder cannot be its own parent');
      }
    }

    const path = await this.buildPath(organizationId, name, parentId);

    const orgId = assertValidOrganizationId(organizationId);
    return Folder.findOneAndUpdate(
      withTenantFilter(orgId, { _id: new mongoose.Types.ObjectId(folderId) }),
      {
        name: name.trim(),
        parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
        path,
      },
      { new: true },
    );
  }

  async countDiagrams(organizationId: string, folderId: string): Promise<number> {
    const orgId = assertValidOrganizationId(organizationId);
    return Diagram.countDocuments(
      withTenantFilter(orgId, {
        folderId: new mongoose.Types.ObjectId(folderId),
      }),
    );
  }

  async softDelete(organizationId: string, folderId: string): Promise<void> {
    const diagramCount = await this.countDiagrams(organizationId, folderId);
    if (diagramCount > 0) {
      throw new Error('Cannot delete folder that contains diagrams');
    }

    const childCount = await Folder.countDocuments(
      withTenantFilter(assertValidOrganizationId(organizationId), {
        parentId: new mongoose.Types.ObjectId(folderId),
      }),
    );
    if (childCount > 0) {
      throw new Error('Cannot delete folder that contains subfolders');
    }

    const folder = await this.findById(organizationId, folderId);
    if (folder) {
      folder.deletedAt = new Date();
      await folder.save();
    }
  }

  async toListItem(organizationId: string, folder: IFolder): Promise<FolderListItem> {
    const diagramCount = await this.countDiagrams(organizationId, folder._id.toString());
    return {
      id: folder._id.toString(),
      projectId: folder.projectId.toString(),
      parentId: folder.parentId?.toString() ?? null,
      name: folder.name,
      path: folder.path,
      diagramCount,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt,
    };
  }

  async findAllWithCounts(organizationId: string, projectId: string): Promise<FolderListItem[]> {
    const folders = await this.findByProject(organizationId, projectId);
    return Promise.all(folders.map((f) => this.toListItem(organizationId, f)));
  }
}

export const folderRepository = new FolderRepository();
