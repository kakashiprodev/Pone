ALTER TABLE "data"."users" DROP CONSTRAINT "users_last_selected_project_projects_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data"."users" ADD CONSTRAINT "users_last_selected_project_projects_id_fk" FOREIGN KEY ("last_selected_project") REFERENCES "data"."projects"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
