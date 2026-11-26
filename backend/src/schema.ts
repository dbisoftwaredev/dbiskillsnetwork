import {
  boolean,
  index,
  jsonb,
  numeric,
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
  accountTypeSelectedAt: timestamp('account_type_selected_at', { withTimezone: true }),
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

export const accountSetupTokens = pgTable('account_setup_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('account_setup_tokens_hash_unique').on(table.tokenHash),
  index('account_setup_tokens_user_created_idx').on(table.userId, table.createdAt),
]);

export const googleAuthChallenges = pgTable('google_auth_challenges', {
  id: uuid('id').defaultRandom().primaryKey(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('google_auth_challenges_hash_unique').on(table.tokenHash),
  index('google_auth_challenges_created_idx').on(table.createdAt),
]);

export const googleIdentities = pgTable('google_identities', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  googleSubject: varchar('google_subject', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('google_identities_subject_unique').on(table.googleSubject),
  uniqueIndex('google_identities_user_unique').on(table.userId),
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
  objectKey: varchar('object_key', { length: 300 }),
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

export const passportVisibilityEnum = pgEnum('passport_visibility', ['PUBLIC', 'EMPLOYERS_ONLY', 'PRIVATE']);
export const skillEvidenceTierEnum = pgEnum('skill_evidence_tier', ['DECLARED', 'DEMONSTRATED', 'VERIFIED']);
export const skillConfidenceEnum = pgEnum('skill_confidence', ['VERIFIED', 'PROVISIONAL', 'INSUFFICIENT_EVIDENCE']);
export const skillVerificationSourceEnum = pgEnum('skill_verification_source', [
  'NONE',
  'SKILLVERIFY_ASSESSMENT',
  'RPL_CERTIFICATION',
]);
export const rplDecisionEnum = pgEnum('rpl_decision', ['PENDING', 'APPROVED', 'REJECTED']);

export const taxonomyDomains = pgTable('taxonomy_domains', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  displayOrder: smallint('display_order').notNull(),
  escoGroupCode: varchar('esco_group_code', { length: 32 }),
  version: varchar('version', { length: 16 }).default('v1').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('taxonomy_domains_slug_unique').on(table.slug),
]);

export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  domainId: uuid('domain_id').notNull().references(() => taxonomyDomains.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  escoUri: varchar('esco_uri', { length: 200 }),
  safetyCritical: boolean('safety_critical').default(false).notNull(),
  requiredEvidence: varchar('required_evidence', { length: 200 }).notNull(),
  version: varchar('version', { length: 16 }).default('v1').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('skills_slug_unique').on(table.slug),
  index('skills_domain_idx').on(table.domainId),
]);

export const roleBenchmarks = pgTable('role_benchmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  domainId: uuid('domain_id').notNull().references(() => taxonomyDomains.id, { onDelete: 'cascade' }),
  slug: varchar('slug', { length: 100 }).notNull(),
  title: varchar('title', { length: 120 }).notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  requiredSkillSlugs: jsonb('required_skill_slugs').$type<string[]>().notNull(),
  version: varchar('version', { length: 16 }).default('v1').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('role_benchmarks_slug_unique').on(table.slug),
]);

export const explorerSnapshots = pgTable('explorer_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  roleSlug: varchar('role_slug', { length: 100 }).notNull(),
  readinessBand: varchar('readiness_band', { length: 40 }).notNull(),
  readinessScore: smallint('readiness_score').notNull(),
  matchedSkillSlugs: jsonb('matched_skill_slugs').$type<string[]>().notNull(),
  missingSkillSlugs: jsonb('missing_skill_slugs').$type<string[]>().notNull(),
  answers: jsonb('answers').$type<Record<string, unknown>>().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }),
  redeemedByUserId: uuid('redeemed_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('explorer_snapshots_token_hash_unique').on(table.tokenHash),
  index('explorer_snapshots_expires_idx').on(table.expiresAt),
]);

export const talentProfiles = pgTable('talent_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  handle: varchar('handle', { length: 64 }).notNull(),
  headline: varchar('headline', { length: 160 }),
  bio: varchar('bio', { length: 1000 }),
  availabilityStatus: varchar('availability_status', { length: 40 }).default('OPEN_TO_OPPORTUNITIES').notNull(),
  workPreferences: jsonb('work_preferences').$type<{ remote?: boolean; relocate?: boolean; contractTypes?: string[] }>(),
  passportVisibility: passportVisibilityEnum('passport_visibility').default('PUBLIC').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('talent_profiles_handle_unique').on(table.handle),
]);

export const credentialWalletItems = pgTable('credential_wallet_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 160 }).notNull(),
  qualificationCode: varchar('qualification_code', { length: 40 }),
  issuer: varchar('issuer', { length: 120 }).notNull(),
  documentName: varchar('document_name', { length: 200 }).notNull(),
  documentSha256: varchar('document_sha256', { length: 64 }).notNull(),
  objectKey: varchar('object_key', { length: 300 }),
  issueDate: varchar('issue_date', { length: 20 }),
  expiryDate: varchar('expiry_date', { length: 20 }),
  mappedSkillIds: jsonb('mapped_skill_ids').$type<string[]>().notNull(),
  rplRequested: boolean('rpl_requested').default(true).notNull(),
  rplStatus: rplDecisionEnum('rpl_status').default('PENDING').notNull(),
  decidedByUserId: uuid('decided_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  decisionReason: varchar('decision_reason', { length: 1000 }),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  notes: varchar('notes', { length: 1000 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('credential_wallet_items_user_idx').on(table.userId, table.createdAt),
  index('credential_wallet_items_rpl_status_idx').on(table.rplStatus, table.createdAt),
]);

export const passportSkills = pgTable('passport_skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  evidenceTier: skillEvidenceTierEnum('evidence_tier').default('DECLARED').notNull(),
  confidence: skillConfidenceEnum('confidence').default('INSUFFICIENT_EVIDENCE').notNull(),
  proficiency: numeric('proficiency', { precision: 2, scale: 1 }),
  selfRating: smallint('self_rating'),
  verificationSource: skillVerificationSourceEnum('verification_source').default('NONE').notNull(),
  verifiedLabel: varchar('verified_label', { length: 120 }),
  verifiedCredentialId: uuid('verified_credential_id').references(() => credentialWalletItems.id, { onDelete: 'set null' }),
  evidenceNote: varchar('evidence_note', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('passport_skills_user_skill_unique').on(table.userId, table.skillId),
  index('passport_skills_user_idx').on(table.userId),
]);

export const schema = {
  taxonomyDomains,
  skills,
  roleBenchmarks,
  explorerSnapshots,
  talentProfiles,
  credentialWalletItems,
  passportSkills,
  organizationVerificationSubmissions,
  userProfiles,
  communicationPreferences,
  auditLogs,
  users,
  consentRecords,
  emailVerificationTokens,
  accountSetupTokens,
  googleAuthChallenges,
  googleIdentities,
  passwordResetTokens,
  refreshTokens,
  emailOtpChallenges,
  organizations,
  organizationMembers,
  organizationInvitations,
};
