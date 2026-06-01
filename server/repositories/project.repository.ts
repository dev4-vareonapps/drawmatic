import mongoose from 'mongoose';
import { Project, type IProject } from '@/models/project.model';
import { Diagram } from '@/models/diagram.model';
import { slugify } from '@/lib/utils';
import { withTenantFilter, assertValidOrganizationId } from '@/server/middleware/tenant.middleware';

export interface ProjectWithDiagramCount {
  id: string;
  name: string;
  description: string;
  slug: string;
  diagramCount: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectRepository {
  async countByOrganization(organizationId: string): Promise<number> {
    const orgId = assertValidOrganizationId(organizationId);
    return Project.countDocuments(withTenantFilter(orgId));
  }

  async findByOrganization(organizationId: string): Promise<IProject[]> {
    const orgId = assertValidOrganizationId(organizationId);
    return Project.find(withTenantFilter(orgId)).sort({ updatedAt: -1 });
  }

  async findById(organizationId: string, projectId: string): Promise<IProject | null> {
    const orgId = assertValidOrganizationId(organizationId);
    return Project.findOne(
      withTenantFilter(orgId, { _id: new mongoose.Types.ObjectId(projectId) }),
    );
  }

  async findBySlug(organizationId: string, slug: string): Promise<IProject | null> {
    const orgId = assertValidOrganizationId(organizationId);
    return Project.findOne(withTenantFilter(orgId, { slug }));
  }

  async generateUniqueSlug(organizationId: string, name: string): Promise<string> {
    const baseSlug = slugify(name) || 'project';
    let slug = baseSlug;
    let suffix = 0;
    while (await this.findBySlug(organizationId, slug)) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
    return slug;
  }

  async create(
    organizationId: string,
    data: {
      name: string;
      description?: string;
      createdBy: string;
      updatedBy: string;
    },
  ): Promise<IProject> {
    const orgId = assertValidOrganizationId(organizationId);
    const slug = await this.generateUniqueSlug(organizationId, data.name);
    return Project.create({
      organizationId: orgId,
      name: data.name,
      description: data.description ?? '',
      slug,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    });
  }

  async update(
    organizationId: string,
    projectId: string,
    data: Partial<{ name: string; description: string; updatedBy: string }>,
  ): Promise<IProject | null> {
    const orgId = assertValidOrganizationId(organizationId);
    const existing = await this.findById(organizationId, projectId);
    if (!existing) return null;

    const update: Record<string, unknown> = { ...data };

    if (data.name && data.name !== existing.name) {
      const baseSlug = slugify(data.name) || 'project';
      let slug = baseSlug;
      let suffix = 0;
      while (true) {
        const conflict = await this.findBySlug(organizationId, slug);
        if (!conflict || conflict._id.toString() === projectId) break;
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
      }
      update.slug = slug;
    }

    return Project.findOneAndUpdate(
      withTenantFilter(orgId, { _id: new mongoose.Types.ObjectId(projectId) }),
      update,
      { new: true },
    );
  }

  async softDelete(organizationId: string, projectId: string): Promise<void> {
    const project = await this.findById(organizationId, projectId);
    if (project) {
      project.deletedAt = new Date();
      await project.save();
    }
  }

  private async attachDiagramCount(
    organizationId: string,
    project: IProject,
  ): Promise<ProjectWithDiagramCount> {
    const orgId = assertValidOrganizationId(organizationId);
    const diagramCount = await Diagram.countDocuments(
      withTenantFilter(orgId, {
        projectId: project._id,
      }),
    );
    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description ?? '',
      slug: project.slug,
      diagramCount,
      createdBy: project.createdBy.toString(),
      updatedBy: project.updatedBy.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  async findAllWithDiagramCounts(organizationId: string): Promise<ProjectWithDiagramCount[]> {
    const projects = await this.findByOrganization(organizationId);
    return Promise.all(projects.map((p) => this.attachDiagramCount(organizationId, p)));
  }

  async findRecentWithDiagramCounts(
    organizationId: string,
    limit = 5,
  ): Promise<ProjectWithDiagramCount[]> {
    const orgId = assertValidOrganizationId(organizationId);
    const projects = await Project.find(withTenantFilter(orgId))
      .sort({ updatedAt: -1 })
      .limit(limit);
    return Promise.all(projects.map((p) => this.attachDiagramCount(organizationId, p)));
  }
}

export const projectRepository = new ProjectRepository();
