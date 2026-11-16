CREATE TYPE "public"."email_otp_purpose" AS ENUM('MFA_ENROLLMENT', 'MFA_SIGN_IN');--> statement-breakpoint
CREATE TABLE "email_otp_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"purpose" "email_otp_purpose" NOT NULL,
	"challenge_hash" varchar(64) NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempt_count" smallint DEFAULT 0 NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_otp_challenges" ADD CONSTRAINT "email_otp_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_otp_challenges_hash_unique" ON "email_otp_challenges" USING btree ("challenge_hash");--> statement-breakpoint
CREATE INDEX "email_otp_challenges_user_created_idx" ON "email_otp_challenges" USING btree ("user_id","created_at");