import { createHash } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { AuditService } from '../audit/audit.service';
import { DatabaseService } from '../database';
import {
  credentialWalletItems,
  explorerSnapshots,
  organizationMembers,
  organizations,
  passportSkills,
  skills,
  talentProfiles,
  taxonomyDomains,
  userProfiles,
  users,
} from '../schema';
import {
  AddPassportSkillDto,
  DecideRplDto,
  SubmitCredentialDto,
  UpdatePassportVisibilityDto,
  UpdateTalentProfileDto,
} from './passport.dto';
import {
  buildDefaultHandle,
  buildRplVerifiedLabel,
  canAccessPassport,
  formatPublicPassport,
  validateRplDecision,
} from './passport.policy';

@Injectable()
export class PassportService {
  constructor(
    private readonly database: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private async ensureTalentProfile(userId: string) {
    const [existing] = await this.database.db
      .select()
      .from(talentProfiles)
      .where(eq(talentProfiles.userId, userId))
      .limit(1);
    if (existing) return existing;

    const [profile] = await this.database.db
      .select({ displayName: userProfiles.displayName })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    const handle = buildDefaultHandle(profile?.displayName, userId);
    const [created] = await this.database.db
      .insert(talentProfiles)
      .values({ userId, handle })
      .onConflictDoNothing({ target: talentProfiles.userId })
      .returning();

    if (created) return created;
    const [reloaded] = await this.database.db
      .select()
      .from(talentProfiles)
      .where(eq(talentProfiles.userId, userId))
      .limit(1);
    return reloaded;
  }

  private async fetchSkillViews(userId: string) {
    return this.database.db
      .select({
        id: passportSkills.id,
        skillId: skills.id,
        skillSlug: skills.slug,
        skillName: skills.name,
        domainName: taxonomyDomains.name,
        safetyCritical: skills.safetyCritical,
        evidenceTier: passportSkills.evidenceTier,
        confidence: passportSkills.confidence,
        proficiency: passportSkills.proficiency,
        selfRating: passportSkills.selfRating,
        verificationSource: passportSkills.verificationSource,
        verifiedLabel: passportSkills.verifiedLabel,
        evidenceNote: passportSkills.evidenceNote,
      })
      .from(passportSkills)
      .innerJoin(skills, eq(passportSkills.skillId, skills.id))
      .innerJoin(taxonomyDomains, eq(skills.domainId, taxonomyDomains.id))
      .where(eq(passportSkills.userId, userId))
      .orderBy(asc(taxonomyDomains.displayOrder), asc(skills.name));
  }

  async getMyProfile(userId: string) {
    const tp = await this.ensureTalentProfile(userId);
    const [userProfile] = await this.database.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    const mySkills = await this.fetchSkillViews(userId);

    const completionFields = [
      Boolean(userProfile?.displayName),
      Boolean(userProfile?.location),
      Boolean(userProfile?.primaryGoal),
      Boolean(tp.headline),
      Boolean(tp.bio),
      mySkills.length > 0,
    ];
    const completionPercent = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

    return {
      userId,
      handle: tp.handle,
      displayName: userProfile?.displayName ?? null,
      location: userProfile?.location ?? null,
      primaryGoal: userProfile?.primaryGoal ?? null,
      targetOccupation: userProfile?.targetOccupation ?? null,
      headline: tp.headline,
      bio: tp.bio,
      availabilityStatus: tp.availabilityStatus,
      workPreferences: tp.workPreferences ?? null,
      passportVisibility: tp.passportVisibility,
      completionPercent,
      skillsCount: mySkills.length,
    };
  }

  async updateMyProfile(userId: string, input: UpdateTalentProfileDto) {
    await this.ensureTalentProfile(userId);

    return this.database.db.transaction(async (tx) => {
      if (input.handle) {
        const [taken] = await tx
          .select({ userId: talentProfiles.userId })
          .from(talentProfiles)
          .where(eq(talentProfiles.handle, input.handle))
          .limit(1);
        if (taken && taken.userId !== userId) {
          throw new ConflictException('Passport handle is already taken');
        }
      }

      const updates: Partial<typeof talentProfiles.$inferInsert> = { updatedAt: new Date() };
      if (input.handle !== undefined) updates.handle = input.handle;
      if (input.headline !== undefined) updates.headline = input.headline;
      if (input.bio !== undefined) updates.bio = input.bio;
      if (input.availabilityStatus !== undefined) updates.availabilityStatus = input.availabilityStatus;
      if (input.workPreferences !== undefined) updates.workPreferences = input.workPreferences;

      await tx.update(talentProfiles).set(updates).where(eq(talentProfiles.userId, userId));

      let redeemedSnapshot: { snapshotId: string; roleSlug: string; readinessBand: string; readinessScore: number } | null = null;
      if (input.explorerHandoffToken) {
        if (!input.confirmExplorerSnapshot) {
          throw new BadRequestException('confirmExplorerSnapshot must be true to redeem an Explorer snapshot');
        }
        const tokenHash = createHash('sha256').update(input.explorerHandoffToken).digest('hex');
        const [snapshot] = await tx
          .select()
          .from(explorerSnapshots)
          .where(eq(explorerSnapshots.tokenHash, tokenHash))
          .limit(1)
          .for('update');

        if (!snapshot) throw new NotFoundException('Explorer snapshot token not found');
        if (snapshot.redeemedAt) throw new ConflictException('Explorer snapshot token has already been redeemed');
        if (snapshot.expiresAt <= new Date()) throw new BadRequestException('Explorer snapshot token has expired');

        await tx
          .update(explorerSnapshots)
          .set({ redeemedAt: new Date(), redeemedByUserId: userId })
          .where(eq(explorerSnapshots.id, snapshot.id));

        if (snapshot.matchedSkillSlugs.length > 0) {
          const matchedSkills = await tx
            .select({ id: skills.id })
            .from(skills)
            .where(inArray(skills.slug, snapshot.matchedSkillSlugs));
          for (const skill of matchedSkills) {
            await tx.insert(passportSkills).values({
              userId,
              skillId: skill.id,
              evidenceTier: 'DECLARED',
              confidence: 'INSUFFICIENT_EVIDENCE',
              proficiency: null,
              verificationSource: 'NONE',
              evidenceNote: 'Imported from Career Readiness Explorer',
            }).onConflictDoNothing({ target: [passportSkills.userId, passportSkills.skillId] });
          }
        }

        redeemedSnapshot = {
          snapshotId: snapshot.id,
          roleSlug: snapshot.roleSlug,
          readinessBand: snapshot.readinessBand,
          readinessScore: snapshot.readinessScore,
        };
      }

      return { updated: true, redeemedSnapshot };
    }).then(async (res) => ({
      ...(await this.getMyProfile(userId)),
      redeemedSnapshot: res.redeemedSnapshot,
    }));
  }

  async addPassportSkill(userId: string, input: AddPassportSkillDto) {
    await this.ensureTalentProfile(userId);
    const [skill] = await this.database.db
      .select({ id: skills.id, name: skills.name })
      .from(skills)
      .where(eq(skills.id, input.skillId))
      .limit(1);
    if (!skill) throw new NotFoundException('Taxonomy skill not found');

    const [created] = await this.database.db
      .insert(passportSkills)
      .values({
        userId,
        skillId: input.skillId,
        evidenceTier: 'DECLARED',
        confidence: 'INSUFFICIENT_EVIDENCE',
        proficiency: null,
        selfRating: input.selfRating ?? null,
        verificationSource: 'NONE',
        verifiedLabel: null,
        evidenceNote: input.evidenceNote?.trim() || null,
      })
      .onConflictDoUpdate({
        target: [passportSkills.userId, passportSkills.skillId],
        set: {
          selfRating: input.selfRating ?? null,
          evidenceNote: input.evidenceNote?.trim() || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return created;
  }

  async removePassportSkill(userId: string, passportSkillId: string) {
    const deleted = await this.database.db
      .delete(passportSkills)
      .where(and(eq(passportSkills.id, passportSkillId), eq(passportSkills.userId, userId)))
      .returning({ id: passportSkills.id });
    if (deleted.length === 0) throw new NotFoundException('Passport skill not found');
    return { deleted: true, id: passportSkillId };
  }

  async getMyPassport(userId: string) {
    const profile = await this.getMyProfile(userId);
    const mySkills = await this.fetchSkillViews(userId);
    const credentials = await this.listMyCredentials(userId);

    return {
      ...profile,
      skills: mySkills.map((s) => ({
        ...s,
        proficiency: s.proficiency ? Number(s.proficiency) : null,
      })),
      credentials,
      qrVerificationPath: `/p/${profile.handle}`,
    };
  }

  async updateVisibility(userId: string, input: UpdatePassportVisibilityDto) {
    await this.ensureTalentProfile(userId);
    await this.database.db
      .update(talentProfiles)
      .set({ passportVisibility: input.visibility, updatedAt: new Date() })
      .where(eq(talentProfiles.userId, userId));
    return { visibility: input.visibility };
  }

  async getPublicPassport(handle: string, viewerUserId?: string) {
    const [tp] = await this.database.db
      .select()
      .from(talentProfiles)
      .where(eq(talentProfiles.handle, handle))
      .limit(1);
    if (!tp) throw new NotFoundException('Digital Skills Passport not found');

    const isOwner = Boolean(viewerUserId && viewerUserId === tp.userId);
    let isVerifiedEmployerMember = false;
    if (!isOwner && viewerUserId && tp.passportVisibility === 'EMPLOYERS_ONLY') {
      const verifiedMembership = await this.database.db
        .select({ id: organizations.id })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .where(and(
          eq(organizationMembers.userId, viewerUserId),
          eq(organizations.verificationStatus, 'VERIFIED'),
        ))
        .limit(1);
      isVerifiedEmployerMember = verifiedMembership.length > 0;
    }

    if (!canAccessPassport(tp.passportVisibility, { isOwner, isVerifiedEmployerMember })) {
      throw new ForbiddenException('This Digital Skills Passport is restricted');
    }

    const [userProfile] = await this.database.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, tp.userId))
      .limit(1);
    const skillViews = await this.fetchSkillViews(tp.userId);

    return formatPublicPassport({
      handle: tp.handle,
      displayName: userProfile?.displayName ?? null,
      headline: tp.headline,
      bio: tp.bio,
      location: userProfile?.location ?? null,
      primaryGoal: userProfile?.primaryGoal ?? null,
      targetOccupation: userProfile?.targetOccupation ?? null,
      availabilityStatus: tp.availabilityStatus,
      visibility: tp.passportVisibility,
      skills: skillViews,
    });
  }

  async submitCredential(userId: string, input: SubmitCredentialDto) {
    await this.ensureTalentProfile(userId);
    const validSkills = await this.database.db
      .select({ id: skills.id })
      .from(skills)
      .where(inArray(skills.id, input.mappedSkillIds));
    if (validSkills.length !== input.mappedSkillIds.length) {
      throw new BadRequestException('One or more mappedSkillIds do not exist in the taxonomy');
    }

    const [item] = await this.database.db
      .insert(credentialWalletItems)
      .values({
        userId,
        title: input.title.trim(),
        qualificationCode: input.qualificationCode?.trim() || null,
        issuer: input.issuer.trim(),
        documentName: input.documentName.trim(),
        documentSha256: input.documentSha256,
        objectKey: input.objectKey?.trim() || null,
        issueDate: input.issueDate?.trim() || null,
        expiryDate: input.expiryDate?.trim() || null,
        mappedSkillIds: input.mappedSkillIds,
        rplRequested: true,
        rplStatus: 'PENDING',
        notes: input.notes?.trim() || null,
      })
      .returning();

    await this.audit.record({
      actorUserId: userId,
      action: 'RPL_CREDENTIAL_SUBMITTED',
      targetType: 'CREDENTIAL_WALLET_ITEM',
      targetId: item.id,
      metadata: {
        qualificationCode: item.qualificationCode,
        issuer: item.issuer,
        mappedSkillIds: item.mappedSkillIds,
      },
    });

    return item;
  }

  listMyCredentials(userId: string) {
    return this.database.db
      .select()
      .from(credentialWalletItems)
      .where(eq(credentialWalletItems.userId, userId))
      .orderBy(desc(credentialWalletItems.createdAt));
  }

  listPendingRplVerifications() {
    return this.database.db
      .select({
        credentialId: credentialWalletItems.id,
        userId: credentialWalletItems.userId,
        talentEmail: users.email,
        title: credentialWalletItems.title,
        qualificationCode: credentialWalletItems.qualificationCode,
        issuer: credentialWalletItems.issuer,
        documentName: credentialWalletItems.documentName,
        documentSha256: credentialWalletItems.documentSha256,
        objectKey: credentialWalletItems.objectKey,
        issueDate: credentialWalletItems.issueDate,
        expiryDate: credentialWalletItems.expiryDate,
        mappedSkillIds: credentialWalletItems.mappedSkillIds,
        notes: credentialWalletItems.notes,
        submittedAt: credentialWalletItems.createdAt,
      })
      .from(credentialWalletItems)
      .innerJoin(users, eq(credentialWalletItems.userId, users.id))
      .where(eq(credentialWalletItems.rplStatus, 'PENDING'))
      .orderBy(asc(credentialWalletItems.createdAt));
  }

  async decideRplVerification(credentialId: string, adminUserId: string, input: DecideRplDto) {
    const error = validateRplDecision(input.decision, input.reason);
    if (error) throw new BadRequestException(error);

    return this.database.db.transaction(async (tx) => {
      const [item] = await tx
        .select()
        .from(credentialWalletItems)
        .where(and(eq(credentialWalletItems.id, credentialId), eq(credentialWalletItems.rplStatus, 'PENDING')))
        .limit(1)
        .for('update');
      if (!item) throw new NotFoundException('No pending RPL verification found for this credential');

      const now = new Date();
      const status = input.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      await tx
        .update(credentialWalletItems)
        .set({
          rplStatus: status,
          decidedByUserId: adminUserId,
          decisionReason: input.reason?.trim() || null,
          decidedAt: now,
          updatedAt: now,
        })
        .where(eq(credentialWalletItems.id, credentialId));

      let verifiedLabel: string | null = null;
      if (input.decision === 'APPROVE') {
        verifiedLabel = buildRplVerifiedLabel(item.qualificationCode, item.title);
        for (const skillId of item.mappedSkillIds) {
          await tx
            .insert(passportSkills)
            .values({
              userId: item.userId,
              skillId,
              evidenceTier: 'VERIFIED',
              confidence: 'VERIFIED',
              proficiency: null,
              verificationSource: 'RPL_CERTIFICATION',
              verifiedLabel,
              verifiedCredentialId: item.id,
            })
            .onConflictDoUpdate({
              target: [passportSkills.userId, passportSkills.skillId],
              set: {
                evidenceTier: 'VERIFIED',
                confidence: 'VERIFIED',
                verificationSource: 'RPL_CERTIFICATION',
                verifiedLabel,
                verifiedCredentialId: item.id,
                updatedAt: now,
              },
            });
        }
      }

      await this.audit.record({
        actorUserId: adminUserId,
        action: input.decision === 'APPROVE' ? 'RPL_VERIFICATION_APPROVED' : 'RPL_VERIFICATION_REJECTED',
        targetType: 'CREDENTIAL_WALLET_ITEM',
        targetId: credentialId,
        metadata: {
          talentUserId: item.userId,
          mappedSkillIds: item.mappedSkillIds,
          verifiedLabel,
          reason: input.reason?.trim() || null,
        },
      }, tx);

      return {
        credentialId,
        rplStatus: status,
        verifiedLabel,
        promotedSkillIds: input.decision === 'APPROVE' ? item.mappedSkillIds : [],
      };
    });
  }
}
