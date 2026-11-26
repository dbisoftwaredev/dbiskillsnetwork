CREATE TYPE "public"."passport_visibility" AS ENUM('PUBLIC', 'EMPLOYERS_ONLY', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."rpl_decision" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."skill_confidence" AS ENUM('VERIFIED', 'PROVISIONAL', 'INSUFFICIENT_EVIDENCE');--> statement-breakpoint
CREATE TYPE "public"."skill_evidence_tier" AS ENUM('DECLARED', 'DEMONSTRATED', 'VERIFIED');--> statement-breakpoint
CREATE TYPE "public"."skill_verification_source" AS ENUM('NONE', 'SKILLVERIFY_ASSESSMENT', 'RPL_CERTIFICATION');--> statement-breakpoint
CREATE TABLE "credential_wallet_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"qualification_code" varchar(40),
	"issuer" varchar(120) NOT NULL,
	"document_name" varchar(200) NOT NULL,
	"document_sha256" varchar(64) NOT NULL,
	"object_key" varchar(300),
	"issue_date" varchar(20),
	"expiry_date" varchar(20),
	"mapped_skill_ids" jsonb NOT NULL,
	"rpl_requested" boolean DEFAULT true NOT NULL,
	"rpl_status" "rpl_decision" DEFAULT 'PENDING' NOT NULL,
	"decided_by_user_id" uuid,
	"decision_reason" varchar(1000),
	"decided_at" timestamp with time zone,
	"notes" varchar(1000),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explorer_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"role_slug" varchar(100) NOT NULL,
	"readiness_band" varchar(40) NOT NULL,
	"readiness_score" smallint NOT NULL,
	"matched_skill_slugs" jsonb NOT NULL,
	"missing_skill_slugs" jsonb NOT NULL,
	"answers" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"redeemed_at" timestamp with time zone,
	"redeemed_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passport_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"evidence_tier" "skill_evidence_tier" DEFAULT 'DECLARED' NOT NULL,
	"confidence" "skill_confidence" DEFAULT 'INSUFFICIENT_EVIDENCE' NOT NULL,
	"proficiency" numeric(2, 1),
	"self_rating" smallint,
	"verification_source" "skill_verification_source" DEFAULT 'NONE' NOT NULL,
	"verified_label" varchar(120),
	"verified_credential_id" uuid,
	"evidence_note" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" uuid NOT NULL,
	"slug" varchar(100) NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" varchar(500) NOT NULL,
	"required_skill_slugs" jsonb NOT NULL,
	"version" varchar(16) DEFAULT 'v1' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain_id" uuid NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" varchar(500) NOT NULL,
	"esco_uri" varchar(200),
	"safety_critical" boolean DEFAULT false NOT NULL,
	"required_evidence" varchar(200) NOT NULL,
	"version" varchar(16) DEFAULT 'v1' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"handle" varchar(64) NOT NULL,
	"headline" varchar(160),
	"bio" varchar(1000),
	"availability_status" varchar(40) DEFAULT 'OPEN_TO_OPPORTUNITIES' NOT NULL,
	"work_preferences" jsonb,
	"passport_visibility" "passport_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxonomy_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" varchar(500) NOT NULL,
	"display_order" smallint NOT NULL,
	"esco_group_code" varchar(32),
	"version" varchar(16) DEFAULT 'v1' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_verification_submissions" ADD COLUMN "object_key" varchar(300);--> statement-breakpoint
ALTER TABLE "credential_wallet_items" ADD CONSTRAINT "credential_wallet_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_wallet_items" ADD CONSTRAINT "credential_wallet_items_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explorer_snapshots" ADD CONSTRAINT "explorer_snapshots_redeemed_by_user_id_users_id_fk" FOREIGN KEY ("redeemed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passport_skills" ADD CONSTRAINT "passport_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passport_skills" ADD CONSTRAINT "passport_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passport_skills" ADD CONSTRAINT "passport_skills_verified_credential_id_credential_wallet_items_id_fk" FOREIGN KEY ("verified_credential_id") REFERENCES "public"."credential_wallet_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_benchmarks" ADD CONSTRAINT "role_benchmarks_domain_id_taxonomy_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."taxonomy_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_domain_id_taxonomy_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."taxonomy_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_profiles" ADD CONSTRAINT "talent_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credential_wallet_items_user_idx" ON "credential_wallet_items" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "credential_wallet_items_rpl_status_idx" ON "credential_wallet_items" USING btree ("rpl_status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "explorer_snapshots_token_hash_unique" ON "explorer_snapshots" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "explorer_snapshots_expires_idx" ON "explorer_snapshots" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "passport_skills_user_skill_unique" ON "passport_skills" USING btree ("user_id","skill_id");--> statement-breakpoint
CREATE INDEX "passport_skills_user_idx" ON "passport_skills" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_benchmarks_slug_unique" ON "role_benchmarks" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_slug_unique" ON "skills" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "skills_domain_idx" ON "skills" USING btree ("domain_id");--> statement-breakpoint
CREATE UNIQUE INDEX "talent_profiles_handle_unique" ON "talent_profiles" USING btree ("handle");--> statement-breakpoint
CREATE UNIQUE INDEX "taxonomy_domains_slug_unique" ON "taxonomy_domains" USING btree ("slug");