import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, gt, isNull, ne } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import { DatabaseService } from '../database';
import { AuthEmailService } from '../auth/email.service';
import { AuthenticatedUser } from '../auth/jwt-auth.guard';
import {
  organizationInvitations,
  organizationMembers,
  organizations,
  users,
} from '../schema';
import { canManageRole, OrganizationRole } from './organization.policy';
import { CreateOrganizationDto, UpdateOrganizationDto } from './organization.dto';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class OrganizationService {
  constructor(
    private readonly database: DatabaseService,
    private readonly email: AuthEmailService,
  ) {}

  async listForUser(userId: string) {
    return this.database.db.select({
      id: organizations.id,
      name: organizations.name,
      cacRegistrationNumber: organizations.cacRegistrationNumber,
      sector: organizations.sector,
      verificationStatus: organizations.verificationStatus,
      createdAt: organizations.createdAt,
      role: organizationMembers.role,
    })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, userId));
  }

  async create(user: AuthenticatedUser, input: CreateOrganizationDto) {
    if (user.accountType !== 'ORGANIZATION_REPRESENTATIVE') {
      throw new ForbiddenException('Only organization representatives can create workspaces');
    }
    const name = input.name.trim();
    if (!name) throw new BadRequestException('Organization name must not be empty');
    const cacRegistrationNumber = input.cacRegistrationNumber?.trim().toUpperCase() || null;
    const sector = input.sector?.trim() || null;

    return this.database.db.transaction(async (tx) => {
      const [organization] = await tx.insert(organizations).values({
        name,
        cacRegistrationNumber,
        sector,
      }).returning();
      await tx.insert(organizationMembers).values({
        organizationId: organization.id,
        userId: user.sub,
        role: 'OWNER',
      });
      return organization;
    });
  }

  async getById(organizationId: string) {
    const [organization] = await this.database.db.select().from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);
    if (!organization) throw new NotFoundException('Organization was not found');
    return organization;
  }

  async update(organizationId: string, input: UpdateOrganizationDto) {
    const updates: Partial<typeof organizations.$inferInsert> = { updatedAt: new Date() };
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('Organization name must not be empty');
      updates.name = name;
    }
    if (input.cacRegistrationNumber !== undefined) {
      updates.cacRegistrationNumber = input.cacRegistrationNumber?.trim().toUpperCase() || null;
    }
    if (input.sector !== undefined) updates.sector = input.sector?.trim() || null;

    const [organization] = await this.database.db.update(organizations)
      .set(updates)
      .where(eq(organizations.id, organizationId))
      .returning();
    if (!organization) throw new NotFoundException('Organization was not found');
    return organization;
  }

  async listMembers(organizationId: string) {
    return this.database.db.select({
      userId: users.id,
      email: users.email,
      role: organizationMembers.role,
      joinedAt: organizationMembers.createdAt,
    })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, organizationId));
  }

  async invite(
    user: AuthenticatedUser,
    organizationId: string,
    input: { email: string; role: Exclude<OrganizationRole, 'OWNER'> },
    actorRole: OrganizationRole,
  ): Promise<{ message: string }> {
    if (!canManageRole(actorRole, input.role, 'invite')) {
      throw new ForbiddenException('Your organization role cannot invite a member with this role');
    }
    const email = input.email.trim().toLowerCase();
    const [existingUser] = await this.database.db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser) {
      const [existingMembership] = await this.database.db.select({ id: organizationMembers.id })
        .from(organizationMembers)
        .where(and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, existingUser.id),
        ))
        .limit(1);
      if (existingMembership) throw new ConflictException('This user is already an organization member');
    }

    const [organization] = await this.database.db.select({
      id: organizations.id,
      name: organizations.name,
    }).from(organizations).where(eq(organizations.id, organizationId)).limit(1);
    if (!organization) throw new NotFoundException('Organization was not found');

    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(token);
    await this.database.db.transaction(async (tx) => {
      await tx.delete(organizationInvitations).where(and(
        eq(organizationInvitations.organizationId, organizationId),
        eq(organizationInvitations.email, email),
        isNull(organizationInvitations.acceptedAt),
      ));
      await tx.insert(organizationInvitations).values({
        organizationId,
        invitedByUserId: user.sub,
        email,
        role: input.role,
        tokenHash,
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
      });
    });

    try {
      await this.email.sendOrganizationInvitation(email, organization.name, token);
    } catch (error) {
      await this.database.db.delete(organizationInvitations)
        .where(eq(organizationInvitations.tokenHash, tokenHash));
      throw error;
    }
    return { message: 'Invitation sent' };
  }

  async acceptInvitation(user: AuthenticatedUser, token: string) {
    if (user.accountType !== 'ORGANIZATION_REPRESENTATIVE') {
      throw new ForbiddenException('Only organization representatives can join organization workspaces');
    }
    const tokenHash = this.hashToken(token);
    const now = new Date();
    return this.database.db.transaction(async (tx) => {
      const [invitation] = await tx.select({
        id: organizationInvitations.id,
        organizationId: organizationInvitations.organizationId,
        email: organizationInvitations.email,
        role: organizationInvitations.role,
      }).from(organizationInvitations)
        .where(and(
          eq(organizationInvitations.tokenHash, tokenHash),
          isNull(organizationInvitations.acceptedAt),
          gt(organizationInvitations.expiresAt, now),
        ))
        .limit(1)
        .for('update');
      if (!invitation) throw new ForbiddenException('Invitation is invalid, expired, or already used');
      if (invitation.email !== user.email.trim().toLowerCase()) {
        throw new ForbiddenException('Sign in with the email address that received this invitation');
      }

      await tx.insert(organizationMembers).values({
        organizationId: invitation.organizationId,
        userId: user.sub,
        role: invitation.role,
      });
      await tx.update(organizationInvitations)
        .set({ acceptedAt: now })
        .where(eq(organizationInvitations.id, invitation.id));
      return { organizationId: invitation.organizationId, role: invitation.role };
    });
  }

  async removeMember(
    organizationId: string,
    userId: string,
    targetUserId: string,
    actorRole: OrganizationRole,
  ): Promise<{ removed: true }> {
    const [target] = await this.database.db.select({ role: organizationMembers.role })
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, targetUserId),
      ))
      .limit(1);
    if (!target) throw new NotFoundException('Organization member was not found');
    if (!canManageRole(actorRole, target.role, 'remove')) {
      throw new ForbiddenException('Your organization role cannot remove this member');
    }

    await this.database.db.delete(organizationMembers).where(and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, targetUserId),
      ne(organizationMembers.role, 'OWNER'),
    ));
    return { removed: true };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
