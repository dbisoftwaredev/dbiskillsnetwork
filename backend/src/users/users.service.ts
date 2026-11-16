import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { AuditService } from '../audit/audit.service';
import { readConfig } from '../config';
import { DatabaseService } from '../database';
import {
  communicationPreferences,
  consentRecords,
  organizationMembers,
  organizations,
  userProfiles,
  users,
} from '../schema';
import { UpdateCommunicationPreferencesDto, UpdateMeDto } from './users.dto';
import { canCompleteOnboarding, DEFAULT_COMMUNICATION_PREFERENCES } from './users.policy';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService, private readonly audit: AuditService) {}

  async getMe(userId: string) {
    const db = this.database.db;
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      accountType: users.accountType,
      emailVerified: users.emailVerifiedAt,
      mfaEnabled: users.mfaEnabled,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new NotFoundException('User not found');

    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    const memberships = await db.select({
      organizationId: organizations.id,
      name: organizations.name,
      verificationStatus: organizations.verificationStatus,
      role: organizationMembers.role,
    }).from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, userId));

    return {
      id: user.id,
      email: user.email,
      accountType: user.accountType,
      emailVerified: user.emailVerified !== null,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
      profile: {
        displayName: profile?.displayName ?? null,
        location: profile?.location ?? null,
      },
      onboarding: {
        primaryGoal: profile?.primaryGoal ?? null,
        persona: profile?.persona ?? null,
        targetOccupation: profile?.targetOccupation ?? null,
        step: profile?.onboardingStep ?? 'GOAL',
        completedAt: profile?.onboardingCompletedAt ?? null,
      },
      memberships,
    };
  }

  async updateMe(userId: string, input: UpdateMeDto) {
    const db = this.database.db;
    const [existing] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    const goal = input.primaryGoal ?? existing?.primaryGoal ?? null;
    const completing = input.onboardingStep === 'COMPLETED';
    if (completing && !canCompleteOnboarding(goal)) {
      throw new BadRequestException('Choose a primary goal before completing onboarding');
    }

    const values = {
      ...(input.displayName !== undefined && { displayName: input.displayName }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.primaryGoal !== undefined && { primaryGoal: input.primaryGoal }),
      ...(input.persona !== undefined && { persona: input.persona }),
      ...(input.targetOccupation !== undefined && { targetOccupation: input.targetOccupation }),
      ...(input.onboardingStep !== undefined && { onboardingStep: input.onboardingStep }),
      ...(completing && !existing?.onboardingCompletedAt && { onboardingCompletedAt: new Date() }),
      updatedAt: new Date(),
    };

    await db.insert(userProfiles)
      .values({ userId, ...values })
      .onConflictDoUpdate({ target: userProfiles.userId, set: values });
    return this.getMe(userId);
  }

  async getCommunicationPreferences(userId: string) {
    const db = this.database.db;
    const [prefs] = await db.select().from(communicationPreferences)
      .where(eq(communicationPreferences.userId, userId)).limit(1);
    const [marketing] = await db.select({ granted: consentRecords.granted, version: consentRecords.version, at: consentRecords.createdAt })
      .from(consentRecords)
      .where(and(eq(consentRecords.userId, userId), eq(consentRecords.type, 'MARKETING')))
      .orderBy(desc(consentRecords.createdAt))
      .limit(1);

    const channels = prefs ?? DEFAULT_COMMUNICATION_PREFERENCES;
    return {
      transactional: {
        description: 'Account, security and requested service messages are always sent and are not marketing.',
        email: true,
      },
      channels: {
        email: channels.emailEnabled,
        sms: channels.smsEnabled,
        inApp: channels.inAppEnabled,
        whatsapp: channels.whatsappEnabled,
      },
      frequency: channels.frequency,
      marketing: {
        optedIn: marketing?.granted ?? false,
        version: marketing?.version ?? null,
        updatedAt: marketing?.at ?? null,
      },
    };
  }

  async updateCommunicationPreferences(userId: string, input: UpdateCommunicationPreferencesDto) {
    const { marketingOptIn, ...channelInput } = input;
    const values = {
      ...Object.fromEntries(Object.entries(channelInput).filter(([, v]) => v !== undefined)),
      updatedAt: new Date(),
    };

    await this.database.db.transaction(async (tx) => {
      await tx.insert(communicationPreferences)
        .values({ userId, ...DEFAULT_COMMUNICATION_PREFERENCES, ...values })
        .onConflictDoUpdate({ target: communicationPreferences.userId, set: values });

      if (marketingOptIn !== undefined) {
        await tx.insert(consentRecords).values({
          userId,
          type: 'MARKETING',
          granted: marketingOptIn,
          version: readConfig().privacyVersion,
        });
      }

      await this.audit.record({
        actorUserId: userId,
        action: 'USER_COMMUNICATION_PREFERENCES_UPDATED',
        targetType: 'USER',
        targetId: userId,
        metadata: { changed: Object.keys(channelInput).filter((k) => (channelInput as Record<string, unknown>)[k] !== undefined), marketingOptIn },
      }, tx);
    });

    return this.getCommunicationPreferences(userId);
  }
}

