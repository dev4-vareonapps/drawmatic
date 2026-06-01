import { Invitation, type IInvitation } from '@/models/invitation.model';
import { type Role } from '@/lib/constants/roles';

export class InvitationRepository {
  async findByToken(token: string): Promise<IInvitation | null> {
    return Invitation.findOne({ token, status: 'pending' });
  }

  async findByOrganization(organizationId: string): Promise<IInvitation[]> {
    return Invitation.find({ organizationId, status: 'pending', deletedAt: null });
  }

  async create(data: {
    organizationId: string;
    email: string;
    role: Role;
    token: string;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<IInvitation> {
    return Invitation.create(data);
  }

  async accept(id: string): Promise<IInvitation | null> {
    return Invitation.findByIdAndUpdate(
      id,
      { status: 'accepted', acceptedAt: new Date() },
      { new: true },
    );
  }

  async revoke(id: string): Promise<void> {
    await Invitation.findByIdAndUpdate(id, { status: 'revoked' });
  }
}

export const invitationRepository = new InvitationRepository();
