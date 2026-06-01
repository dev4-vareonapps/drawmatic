import { Organization, type IOrganization } from '@/models/organization.model';

export class OrganizationRepository {
  async findById(id: string): Promise<IOrganization | null> {
    return Organization.findById(id);
  }

  async findBySlug(slug: string): Promise<IOrganization | null> {
    return Organization.findOne({ slug });
  }

  async create(data: {
    name: string;
    slug: string;
    ownerId: string;
    description?: string;
  }): Promise<IOrganization> {
    return Organization.create(data);
  }

  async update(
    id: string,
    data: Partial<{ name: string; slug: string; description: string; logoUrl: string }>,
  ): Promise<IOrganization | null> {
    return Organization.findByIdAndUpdate(id, data, { new: true });
  }
}

export const organizationRepository = new OrganizationRepository();
