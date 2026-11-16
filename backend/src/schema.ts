import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const accountTypeEnum = pgEnum('account_type', ['TALENT', 'ORGANIZATION_REPRESENTATIVE']);
export const consentTypeEnum = pgEnum('consent_type', ['TERMS', 'PRIVACY', 'MARKETING']);
export const emailOtpPurposeEnum = pgEnum('email_otp_purpose', ['MFA_ENROLLMENT', 'MFA_SIGN_IN']);
export const organizationRoleEnum = pgEnum('organization_role', ['OWNER', 'ADMIN', 'RECRUITER', 'REVIEWER']);
export const organizationVerificationStatusEnum = pgEnum(
  'organization_verification_status',
  ['UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED'],
);

export const platformRoleEnum = pgEnum('platform_role', ['NONE', 'DBI_ADMIN', 'SUPER_ADMIN']);
export const verificationDecisionEnum = pgEnum('verification_decision', ['PENDING', 'APPROVED', 'REJECTED']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 254 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  accountType: accountTypeEnum('account_type').notNull(),
  platformRole: platformRoleEnum('platform_role').default('NONE').notNull(),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  mfaEnabled: boolean('mfa_enabled').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('users_email_unique').on(table.email),
]);

export const consentRecords = pgTable('consent_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: consentTypeEnum('type').notNull(),
  granted: boolean('granted').notNull(),
  version: varchar('version', { length: 32 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('consent_records_user_created_idx').on(table.userId, table.createdAt),
]);

export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('email_verification_tokens_hash_unique').on(table.tokenHash),
  index('email_verification_tokens_user_idx').on(table.userId),
]);

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('password_reset_tokens_hash_unique').on(table.tokenHash),
  index('password_reset_tokens_user_idx').on(table.userId),
]);

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('refresh_tokens_hash_unique').on(table.tokenHash),
  index('refresh_tokens_user_idx').on(table.userId),
]);

export const emailOtpChallenges = pgTable('email_otp_challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  purpose: emailOtpPurposeEnum('purpose').notNull(),
  challengeHash: varchar('challenge_hash', { length: 64 }).notNull(),
  codeHash: varchar('code_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  attemptCount: smallint('attempt_count').default(0).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('email_otp_challenges_hash_unique').on(table.challengeHash),
  index('email_otp_challenges_user_created_idx').on(table.userId, table.createdAt),
]);

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  cacRegistrationNumber: varchar('cac_registration_number', { length: 32 }),
  sector: varchar('sector', { length: 80 }),
  verificationStatus: organizationVerificationStatusEnum('verification_status').default('UNVERIFIED').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('organizations_cac_registration_number_unique').on(table.cacRegistrationNumber),
]);

export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: organizationRoleEnum('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('organization_members_org_user_unique').on(table.organizationId, table.userId),
  index('organization_members_user_idx').on(table.userId),
]);

export const organizationInvitations = pgTable('organization_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  invitedByUserId: uuid('invited_by_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 254 }).notNull(),
  role: organizationRoleEnum('role').notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('organization_invitations_token_hash_unique').on(table.tokenHash),
  uniqueIndex('organization_invitations_pending_email_unique')
    .on(table.organizationId, table.email)
    .where(sql`${table.acceptedAt} IS NULL`),
  index('organization_invitations_org_idx').on(table.organizationId),
]);

export const onboardingGoalEnum = pgEnum('onboarding_goal', [
  'FIND_JOB',
  'GROW_INCOME',
  'REACH_DREAM_OCCUPATION',
  'BUILD_EXPERT_REPUTATION',
]);
export const talentPersonaEnum = pgEnum('talent_persona', [
  'EARLY_CAREER',
  'EXPERIENCED_TECHNICIAN',
  'SENIOR_EXPERT',
  'FREELANCER',
]);
export const notificationFrequencyEnum = pgEnum('notification_frequency', [
  'IMMEDIATE',
  'DAILY_DIGEST',
  'WEEKLY_DIGEST',
  'NONE',
]);

export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 120 }),
  location: varchar('location', { length: 120 }),
  primaryGoal: onboardingGoalEnum('primary_goal'),
  persona: talentPersonaEnum('persona'),
  targetOccupation: varchar('target_occupation', { length: 120 }),
  onboardingStep: varchar('onboarding_step', { length: 40 }),
  onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const communicationPreferences = pgTable('communication_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  emailEnabled: boolean('email_enabled').default(true).notNull(),
  smsEnabled: boolean('sms_enabled').default(false).notNull(),
  inAppEnabled: boolean('in_app_enabled').default(true).notNull(),
  whatsappEnabled: boolean('whatsapp_enabled').default(false).notNull(),
  frequency: notificationFrequencyEnum('frequency').default('IMMEDIATE').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 80 }).notNull(),
  targetType: varchar('target_type', { length: 40 }).notNull(),
  targetId: uuid('target_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('audit_logs_target_idx').on(table.targetType, table.targetId),
  index('audit_logs_actor_created_idx').on(table.actorUserId, table.createdAt),
]);

export const organizationVerificationSubmissions = pgTable('organization_verification_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  submittedByUserId: uuid('submitted_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  documentName: varchar('document_name', { length: 200 }).notNull(),
  documentSha256: varchar('document_sha256', { length: 64 }).notNull(),
  notes: varchar('notes', { length: 1000 }),
  decision: verificationDecisionEnum('decision').default('PENDING').notNull(),
  decidedByUserId: uuid('decided_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  decisionReason: varchar('decision_reason', { length: 1000 }),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('org_verification_submissions_org_idx').on(table.organizationId, table.createdAt),
  uniqueIndex('org_verification_submissions_pending_unique')
    .on(table.organizationId)
    .where(sql`${table.decision} = 'PENDING'`),
]);

export const schema = {
  organizationVerificationSubmissions,
  userProfiles,
  communicationPreferences,
  auditLogs,
  users,
  consentRecords,
  emailVerificationTokens,
  passwordResetTokens,
  refreshTokens,
  emailOtpChallenges,
  organizations,
  organizationMembers,
  organizationInvitations,
};
