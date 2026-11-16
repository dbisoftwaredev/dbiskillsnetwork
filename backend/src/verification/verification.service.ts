import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { AuditService } from '../audit/audit.service';
import { DatabaseService } from '../database';
import { organizations, organizationVerificationSubmissions, users } from '../schema';
import { DecideVerificationDto, SubmitVerificationDto } from './verification.dto';
import { canSubmitForVerification, statusAfterDecision, validateDecision } from './verification.policy';

@Injectable()
export class VerificationService {
  constructor(private readonly database: DatabaseService, private readonly audit: AuditService) {}

  async submit(organizationId: string, actorUserId: string, input: SubmitVerificationDto) {
    return this.database.db.transaction(async (tx) => {
      const [org] = await tx.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1).for('update');
      if (!org) throw new NotFoundException('Organization not found');
      if (!org.cacRegistrationNumber) throw new BadRequestException('Add a CAC registration number before submitting');
      if (!canSubmitForVerification(org.verificationStatus)) {
        throw new ConflictException(`Organization is already ${org.verificationStatus}`);
      }

      const [submission] = await tx.insert(organizationVerificationSubmissions).values({
        organizationId,
        submittedByUserId: actorUserId,
        documentName: input.documentName,
        documentSha256: input.documentSha256,
        notes: input.notes ?? null,
      }).returning();
      await tx.update(organizations)
        .set({ verificationStatus: 'PENDING_REVIEW', updatedAt: new Date() })
        .where(eq(organizations.id, organizationId));
      await this.audit.record({
        actorUserId,
        action: 'ORGANIZATION_VERIFICATION_SUBMITTED',
        targetType: 'ORGANIZATION',
        targetId: organizationId,
        metadata: { submissionId: submission.id, documentSha256: input.documentSha256 },
      }, tx);

      return { submissionId: submission.id, organizationId, verificationStatus: 'PENDING_REVIEW' as const };
    });
  }

  listPending() {
    return this.database.db.select({
      submissionId: organizationVerificationSubmissions.id,
      organizationId: organizations.id,
      organizationName: organizations.name,
      cacRegistrationNumber: organizations.cacRegistrationNumber,
      sector: organizations.sector,
      documentName: organizationVerificationSubmissions.documentName,
      documentSha256: organizationVerificationSubmissions.documentSha256,
      notes: organizationVerificationSubmissions.notes,
      submittedByEmail: users.email,
      submittedAt: organizationVerificationSubmissions.createdAt,
    })
      .from(organizationVerificationSubmissions)
      .innerJoin(organizations, eq(organizationVerificationSubmissions.organizationId, organizations.id))
      .leftJoin(users, eq(organizationVerificationSubmissions.submittedByUserId, users.id))
      .where(eq(organizationVerificationSubmissions.decision, 'PENDING'))
      .orderBy(asc(organizationVerificationSubmissions.createdAt));
  }

  async decide(organizationId: string, adminUserId: string, input: DecideVerificationDto) {
    const error = validateDecision(input.decision, input.reason);
    if (error) throw new BadRequestException(error);

    return this.database.db.transaction(async (tx) => {
      const [pending] = await tx.select().from(organizationVerificationSubmissions)
        .where(and(
          eq(organizationVerificationSubmissions.organizationId, organizationId),
          eq(organizationVerificationSubmissions.decision, 'PENDING'),
        )).limit(1).for('update');
      if (!pending) throw new NotFoundException('No pending verification for this organization');

      const now = new Date();
      const status = statusAfterDecision(input.decision);
      await tx.update(organizationVerificationSubmissions).set({
        decision: input.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        decidedByUserId: adminUserId,
        decisionReason: input.reason?.trim() || null,
        decidedAt: now,
      }).where(eq(organizationVerificationSubmissions.id, pending.id));
      await tx.update(organizations)
        .set({ verificationStatus: status, updatedAt: now })
        .where(eq(organizations.id, organizationId));
      await this.audit.record({
        actorUserId: adminUserId,
        action: input.decision === 'APPROVE' ? 'ORGANIZATION_VERIFICATION_APPROVED' : 'ORGANIZATION_VERIFICATION_REJECTED',
        targetType: 'ORGANIZATION',
        targetId: organizationId,
        metadata: { submissionId: pending.id, reason: input.reason?.trim() || null },
      }, tx);

      return { organizationId, submissionId: pending.id, verificationStatus: status };
    });
  }
}

