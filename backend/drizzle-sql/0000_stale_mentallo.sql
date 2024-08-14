CREATE EXTENSION vector;

CREATE SCHEMA IF NOT EXISTS "data";

CREATE TABLE IF NOT EXISTS "data"."actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"responsible" text NOT NULL,
	"status" text NOT NULL,
	"progress" numeric NOT NULL,
	"site" uuid NOT NULL,
	"relevant" boolean NOT NULL,
	"name" text NOT NULL,
	"description_before" text NOT NULL,
	"description_after" text NOT NULL,
	"target_value_absolut_planned" numeric,
	"target_value_absolut_is" numeric,
	"description_target_value" text,
	"finished_until_planned" timestamp,
	"finished_until_is" timestamp,
	"category" text,
	"costs_planned" numeric,
	"costs_is" numeric,
	"roi" numeric,
	"description_costs" text,
	"avoidance_costs" numeric,
	"start_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."csrdtopics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" text NOT NULL,
	"topic_header" text NOT NULL,
	"summary" text NOT NULL,
	"collected_information" jsonb NOT NULL,
	"is_done" boolean,
	"report" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."equivalents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"scope" integer,
	"specification1" text DEFAULT '' NOT NULL,
	"specification2" text DEFAULT '' NOT NULL,
	"specification3" text DEFAULT '' NOT NULL,
	"add_name1" text DEFAULT '' NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"source" text DEFAULT '' NOT NULL,
	"jan" numeric,
	"feb" numeric,
	"mar" numeric,
	"apr" numeric,
	"may" numeric,
	"jun" numeric,
	"jul" numeric,
	"aug" numeric,
	"sep" numeric,
	"oct" numeric,
	"nov" numeric,
	"dec" numeric,
	"avg_value" numeric,
	"monthly_values" boolean,
	"parent" uuid,
	"project" uuid NOT NULL,
	"in_unit" text DEFAULT '' NOT NULL,
	"out_unit" text DEFAULT 'kg' NOT NULL,
	"import_ref" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site" uuid NOT NULL,
	"name" text NOT NULL,
	"manufacturer" text DEFAULT '' NOT NULL,
	"model" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"shutdown_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"bucket" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"file_type" varchar(255) NOT NULL,
	"file" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."inputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"scope" numeric NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"equivalent" uuid,
	"report" uuid NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"facility" uuid,
	"sum_value" numeric NOT NULL,
	"raw_value" numeric NOT NULL,
	"raw_value_jan" numeric,
	"raw_value_feb" numeric,
	"raw_value_mar" numeric,
	"raw_value_apr" numeric,
	"raw_value_may" numeric,
	"raw_value_jun" numeric,
	"raw_value_jul" numeric,
	"raw_value_aug" numeric,
	"raw_value_sep" numeric,
	"raw_value_oct" numeric,
	"raw_value_nov" numeric,
	"raw_value_dec" numeric,
	"parent" uuid,
	"monthly_values" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"logo" text,
	"logo_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site" uuid NOT NULL,
	"year" numeric NOT NULL,
	"company_name" text DEFAULT '' NOT NULL,
	"company_street" text DEFAULT '' NOT NULL,
	"company_postal" text DEFAULT '' NOT NULL,
	"company_country" text DEFAULT '' NOT NULL,
	"company_city" text DEFAULT '' NOT NULL,
	"company_domain" text DEFAULT '' NOT NULL,
	"contact_name" text DEFAULT '' NOT NULL,
	"contact_telephone" text DEFAULT '' NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"contact_domain" text DEFAULT '' NOT NULL,
	"count_employees" numeric DEFAULT '0' NOT NULL,
	"business_turnover" numeric DEFAULT '0' NOT NULL,
	"base_year" numeric DEFAULT '1901' NOT NULL,
	"sum_emissions" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"project" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report" uuid,
	"year" numeric,
	"percentage" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."user_projects" (
	"user_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	CONSTRAINT "user_projects_user_id_project_id_pk" PRIMARY KEY("user_id","project_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_global_admin" boolean DEFAULT false NOT NULL,
	"firstname" text DEFAULT '' NOT NULL,
	"surname" text DEFAULT '' NOT NULL,
	"department" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"telephone" text DEFAULT '' NOT NULL,
	"display_in_tons" boolean DEFAULT true NOT NULL,
	"last_selected_project" uuid,
	"last_selected_site" uuid,
	"last_selected_report" uuid,
	"selected_theme" text DEFAULT 'light' NOT NULL,
	"can_manage_projects" numeric DEFAULT '1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."actions" ADD CONSTRAINT "actions_site_sites_id_fk" FOREIGN KEY ("site") REFERENCES "data"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."csrdtopics" ADD CONSTRAINT "csrdtopics_report_reports_id_fk" FOREIGN KEY ("report") REFERENCES "data"."reports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."equivalents" ADD CONSTRAINT "equivalents_parent_equivalents_id_fk" FOREIGN KEY ("parent") REFERENCES "data"."equivalents"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."equivalents" ADD CONSTRAINT "equivalents_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "data"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."facilities" ADD CONSTRAINT "facilities_site_sites_id_fk" FOREIGN KEY ("site") REFERENCES "data"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."inputs" ADD CONSTRAINT "inputs_equivalent_equivalents_id_fk" FOREIGN KEY ("equivalent") REFERENCES "data"."equivalents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."inputs" ADD CONSTRAINT "inputs_report_reports_id_fk" FOREIGN KEY ("report") REFERENCES "data"."reports"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."inputs" ADD CONSTRAINT "inputs_facility_facilities_id_fk" FOREIGN KEY ("facility") REFERENCES "data"."facilities"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."inputs" ADD CONSTRAINT "inputs_parent_inputs_id_fk" FOREIGN KEY ("parent") REFERENCES "data"."inputs"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."projects" ADD CONSTRAINT "projects_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "data"."media"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."reports" ADD CONSTRAINT "reports_site_sites_id_fk" FOREIGN KEY ("site") REFERENCES "data"."sites"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."sites" ADD CONSTRAINT "sites_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "data"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."targets" ADD CONSTRAINT "targets_report_reports_id_fk" FOREIGN KEY ("report") REFERENCES "data"."reports"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."user_projects" ADD CONSTRAINT "user_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "data"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."user_projects" ADD CONSTRAINT "user_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "data"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."users" ADD CONSTRAINT "users_last_selected_project_projects_id_fk" FOREIGN KEY ("last_selected_project") REFERENCES "data"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."users" ADD CONSTRAINT "users_last_selected_site_sites_id_fk" FOREIGN KEY ("last_selected_site") REFERENCES "data"."sites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."users" ADD CONSTRAINT "users_last_selected_report_reports_id_fk" FOREIGN KEY ("last_selected_report") REFERENCES "data"."reports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
