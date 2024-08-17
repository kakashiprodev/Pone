ALTER TABLE "data"."actions" DROP CONSTRAINT "actions_site_sites_id_fk";
--> statement-breakpoint
ALTER TABLE "data"."csrdtopics" DROP CONSTRAINT "csrdtopics_report_reports_id_fk";
--> statement-breakpoint
ALTER TABLE "data"."facilities" DROP CONSTRAINT "facilities_site_sites_id_fk";
--> statement-breakpoint
ALTER TABLE "data"."inputs" DROP CONSTRAINT "inputs_equivalent_equivalents_id_fk";
--> statement-breakpoint
ALTER TABLE "data"."projects" DROP CONSTRAINT "projects_logo_id_media_id_fk";
--> statement-breakpoint
ALTER TABLE "data"."users" DROP CONSTRAINT "users_last_selected_project_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "data"."users" DROP CONSTRAINT "users_last_selected_site_sites_id_fk";
--> statement-breakpoint
ALTER TABLE "data"."users" DROP CONSTRAINT "users_last_selected_report_reports_id_fk";
--> statement-breakpoint
ALTER TABLE "data"."actions" ALTER COLUMN "progress" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."actions" ALTER COLUMN "progress" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "data"."actions" ALTER COLUMN "target_value_absolut_planned" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."actions" ALTER COLUMN "target_value_absolut_is" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."actions" ALTER COLUMN "costs_planned" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."actions" ALTER COLUMN "costs_is" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."actions" ALTER COLUMN "roi" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."actions" ALTER COLUMN "avoidance_costs" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "jan" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "feb" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "mar" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "apr" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "may" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "jun" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "jul" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "aug" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "sep" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "oct" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "nov" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "dec" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "avg_value" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "project" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "scope" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "sum_value" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_jan" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_feb" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_mar" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_apr" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_may" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_jun" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_jul" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_aug" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_sep" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_oct" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_nov" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."inputs" ALTER COLUMN "raw_value_dec" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."reports" ALTER COLUMN "year" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."reports" ALTER COLUMN "count_employees" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."reports" ALTER COLUMN "count_employees" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "data"."reports" ALTER COLUMN "business_turnover" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."reports" ALTER COLUMN "business_turnover" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "data"."reports" ALTER COLUMN "base_year" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."reports" ALTER COLUMN "base_year" SET DEFAULT 1901;--> statement-breakpoint
ALTER TABLE "data"."reports" ALTER COLUMN "sum_emissions" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "data"."reports" ALTER COLUMN "sum_emissions" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "data"."targets" ALTER COLUMN "year" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."targets" ALTER COLUMN "percentage" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "data"."users" DROP COLUMN "can_manage_projects";--> statement-breakpoint
ALTER TABLE "data"."users" ADD COLUMN "can_manage_projects" boolean DEFAULT false;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "data"."actions" ADD CONSTRAINT "actions_site_sites_id_fk" FOREIGN KEY ("site") REFERENCES "data"."sites"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."csrdtopics" ADD CONSTRAINT "csrdtopics_report_reports_id_fk" FOREIGN KEY ("report") REFERENCES "data"."reports"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."facilities" ADD CONSTRAINT "facilities_site_sites_id_fk" FOREIGN KEY ("site") REFERENCES "data"."sites"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."inputs" ADD CONSTRAINT "inputs_equivalent_equivalents_id_fk" FOREIGN KEY ("equivalent") REFERENCES "data"."equivalents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."projects" ADD CONSTRAINT "projects_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "data"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."users" ADD CONSTRAINT "users_last_selected_project_projects_id_fk" FOREIGN KEY ("last_selected_project") REFERENCES "data"."projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."users" ADD CONSTRAINT "users_last_selected_site_sites_id_fk" FOREIGN KEY ("last_selected_site") REFERENCES "data"."sites"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."users" ADD CONSTRAINT "users_last_selected_report_reports_id_fk" FOREIGN KEY ("last_selected_report") REFERENCES "data"."reports"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
