UPDATE "data"."projects" SET "logo_id" = NULL;
--> statement-breakpoint
ALTER TABLE "data"."projects" DROP CONSTRAINT "projects_logo_id_media_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."projects" ADD CONSTRAINT "projects_logo_id_files_id_fk" FOREIGN KEY ("logo_id") REFERENCES "data"."files"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
