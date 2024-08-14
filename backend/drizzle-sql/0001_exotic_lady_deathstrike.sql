ALTER TABLE "data"."equivalents" RENAME COLUMN "in_unit" TO "in";--> statement-breakpoint
ALTER TABLE "data"."equivalents" RENAME COLUMN "out_unit" TO "out";--> statement-breakpoint
ALTER TABLE "data"."equivalents" ALTER COLUMN "project" DROP NOT NULL;