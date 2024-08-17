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
ALTER TABLE "data"."users" DROP CONSTRAINT "users_last_selected_site_sites_id_fk";
--> statement-breakpoint
ALTER TABLE "data"."users" DROP CONSTRAINT "users_last_selected_report_reports_id_fk";
--> statement-breakpoint
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
