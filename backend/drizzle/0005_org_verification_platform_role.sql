CREATE TYPE "public"."platform_role" AS ENUM('NONE', 'DBI_ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."verification_decision" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "organization_verification_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"submitted_by_user_id" uuid,
	"document_name" varchar(200) NOT NULL,
	"document_sha256" varchar(64) NOT NULL,
	"notes" varchar(1000),
	"decision" "verification_decision" DEFAULT 'PENDING' NOT NULL,
	"decided_by_user_id" uuid,
	"decision_reason" varchar(1000),
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "platform_role" "platform_role" DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_verification_submissions" ADD CONSTRAINT "organization_verification_submissions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_verification_submissions" ADD CONSTRAINT "organization_verification_submissions_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_verification_submissions" ADD CONSTRAINT "organization_verification_submissions_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "org_verification_submissions_org_idx" ON "organization_verification_submissions" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "org_verification_submissions_pending_unique" ON "organization_verification_submissions" USING btree ("organization_id") WHERE "organization_verification_submissions"."decision" = 'PENDING';