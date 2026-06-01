import { User, type IUser } from '@/models/user.model';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    defaultOrganizationId?: string;
  }): Promise<IUser> {
    return User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      defaultOrganizationId: data.defaultOrganizationId,
    });
  }

  async updateDefaultOrganization(userId: string, organizationId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { defaultOrganizationId: organizationId });
  }
}

export const userRepository = new UserRepository();
