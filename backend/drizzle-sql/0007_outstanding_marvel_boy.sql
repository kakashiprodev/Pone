DELETE FROM "data"."targets" WHERE "report" IS NULL OR "year" IS NULL OR "percentage" IS NULL;--> statement-breakpoint

DROP TABLE "data"."media";--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "scope" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "data"."targets" ALTER COLUMN "report" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "data"."targets" ALTER COLUMN "year" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "data"."targets" ALTER COLUMN "percentage" SET NOT NULL;