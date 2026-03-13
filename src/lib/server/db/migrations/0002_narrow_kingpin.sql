CREATE TABLE IF NOT EXISTS "clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"url_slug" varchar(255),
	"ip" varchar(255),
	"country" varchar(255),
	"city" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clicks" ADD CONSTRAINT "clicks_url_slug_urls_slug_fk" FOREIGN KEY ("url_slug") REFERENCES "public"."urls"("slug") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "url_slug_idx" ON "clicks" USING btree ("url_slug");--> statement-breakpoint
ALTER TABLE "urls" DROP COLUMN IF EXISTS "clicks";