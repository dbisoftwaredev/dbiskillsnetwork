CREATE TABLE "account_setup_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_auth_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"google_subject" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_type_selected_at" timestamp with time zone;--> statement-breakpoint
UPDATE "users" SET "account_type_selected_at" = "created_at";--> statement-breakpoint
ALTER TABLE "account_setup_tokens" ADD CONSTRAINT "account_setup_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_identities" ADD CONSTRAINT "google_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_setup_tokens_hash_unique" ON "account_setup_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "account_setup_tokens_user_created_idx" ON "account_setup_tokens" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "google_auth_challenges_hash_unique" ON "google_auth_challenges" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "google_auth_challenges_created_idx" ON "google_auth_challenges" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "google_identities_subject_unique" ON "google_identities" USING btree ("google_subject");--> statement-breakpoint
CREATE UNIQUE INDEX "google_identities_user_unique" ON "google_identities" USING btree ("user_id");