import { AllowedMentionsTypes, type MessageMentionOptions } from "discord.js";
import { foreignKey, index, integer, jsonb, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";

// ======= Guild Data =======
/**
 * Guilds Table Data
 * @description "id" (pk) - The guild / server identifier
 * @description "owner_id" - The snowflake of the user who owns the guild
 * @description "ticket_channel_id" - Optional reference to a channel ID
 */
export const guildsTable = pgTable("guilds", {
    id: text("id").notNull().primaryKey(),
    owner_id: text("owner_id").notNull(),
    ticket_channel_id: text("ticket_channel"),
}, (table) => [
    index("owner_id_idx").on(table.owner_id),
]);

/**
 * Ticket data (per guild)
 * @description "channel_id" (pk) - The ticket channel identifier
 * @description "guildId" (fk) - The guild / server identifier
 */
export const ticketsTable = pgTable("tickets", {
    channel_id: text("channel_id").primaryKey(),
    guild_id: text("guild_id").notNull(),
    category_id: text("category_id"),
    channel_name: text("name").default("ticket-{user}").notNull(),
    count: integer("count").default(0),
    open: integer("open").default(0),
    message: varchar("message").default("Please be patient for our staff team to respond.").notNull(),
    panel_desc: varchar("panel_desc").default("If you wish to get in contact with our staff team, please click the button below.").notNull(),
    allowed_mentions: jsonb("allowed_mentions").$type<MessageMentionOptions>().default({ parse: [] }).notNull(),
    limit: integer("limit").default(1).notNull()
}, (table) => [
    foreignKey({
        columns: [table.guild_id],
        foreignColumns: [guildsTable.id],
        name: "fk_tickets_guild"
    }).onDelete("cascade")
]);

/**
 * Permission Table (Per Guild)
 * @description Uses composite primary key (guild_id + entity_id)
 */
export const permissionsTable = pgTable("guildPermissions", {
    entityId: text("entity_id").notNull(),
    guildId: text("guild_id").notNull(),
    type: integer("type").notNull()
}, (table) => [
    primaryKey({ columns: [table.guildId, table.entityId] }),
    foreignKey({
        columns: [table.guildId],
        foreignColumns: [guildsTable.id],
        name: "fk_permissions_guild"
    }).onDelete("cascade"),
    index("guild_permissions_idx").on(table.guildId),
]);

/**
 * Blacklist table (users per guild)
 * @description Uses composite primary key (guild_id + user_id)
 */
export const blacklistTable = pgTable("guildBlacklist", {
    userId: text("user_id").notNull(),
    guildId: text("guild_id").notNull(),
    reason: text("reason").notNull(),
    timestamp: timestamp("timestamp").defaultNow()
}, (table) => [
    primaryKey({ columns: [table.guildId, table.userId] }),
    foreignKey({
        columns: [table.guildId],
        foreignColumns: [guildsTable.id],
        name: "fk_blacklist_guild"
    }).onDelete("cascade")
]);