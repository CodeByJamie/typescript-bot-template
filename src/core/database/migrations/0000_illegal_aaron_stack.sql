CREATE TABLE "guildBlacklist" (
	"user_id" text PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"reason" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guilds" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guildPermissions" (
	"guild_id" text NOT NULL,
	"entity_id" text NOT NULL,
	"type" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"guild_id" text NOT NULL,
	"count" integer DEFAULT 0,
	"open" integer DEFAULT 0,
	"message" varchar DEFAULT 'Please be patient for our staff team to respond.',
	"name" text DEFAULT 'ticket-{user}'
);
--> statement-breakpoint
ALTER TABLE "guildBlacklist" ADD CONSTRAINT "fk_blacklist" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guildPermissions" ADD CONSTRAINT "fk_permissions" FOREIGN KEY ("guild_id","entity_id") REFERENCES "public"."guilds"("id","user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "owner_id" ON "guilds" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "guildId" ON "guildPermissions" USING btree ("guild_id");--> statement-breakpoint
CREATE INDEX "entityId" ON "guildPermissions" USING btree ("entity_id");