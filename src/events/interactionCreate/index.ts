import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Events,
    GuildMember,
    InteractionResponse,
    InteractionType,
    Message,
    type AnySelectMenuInteraction,
    type Interaction,
} from "discord.js";
import { database, ExtendedClient, myRedis } from "../../..";
import { TargetUser } from "../../helpers/redis/user/targetUser";
import { ClientButton, ClientEvent, ClientMenu } from "../../types/client";
import type { CachedGuild, CachedUser } from "../../types/redis";
import { Logger, LogType } from "../../utils/logger";
import { guildsTable, ticketsTable } from "../../core/database/schema";
import { eq } from "drizzle-orm";

export default class extends ClientEvent<Events.InteractionCreate> {
    name = Events.InteractionCreate as const

    async execute(interaction: Interaction, client: ExtendedClient) {

        let guildData: CachedGuild | undefined;
        let member: CachedUser;

        // If the guild exists => Fetch the guild data from the cache
        if (interaction.guild) {

            // TODO: remove once happy with saved data
            // await myRedis.del(`cache:${interaction.guild.id}:data`);

            const guildMember = await (new TargetUser(interaction.member as GuildMember).getCache(interaction.guild))

            if (!guildMember) return;

            member = guildMember;

            const payload = await myRedis.get(`cache:${interaction.guildId}:data`);

            // If the redis key exists => parse it
            if (payload) guildData = JSON.parse(payload);

            // If cachedData is null or it is not a string => fetch from the database
            if (!guildData) {

                // Check if there's any data in the database for the guild
                const [dbData] = await database.select().from(guildsTable)
                    .innerJoin(ticketsTable, eq(ticketsTable.guild_id, guildsTable.id))
                    .where(eq(guildsTable.id, interaction.guild.id));

                // If there is no data in the database => set new redis key
                if (!dbData) {
                    guildData = {
                        owner_id: interaction.guild.ownerId,
                        tickets: {
                            category_id: null,
                            channel_id: null,
                            channel_name: "ticket-{user}",
                            open_message: "📩 Please wait for our staff team to respond.",
                            panel_description: "If you wish to get in contact with our staff team, please click the button below.",
                            allowed_mentions: {
                                parse: []
                            },
                            limit: 1,
                        }
                    };

                    // Update the redis to the new data
                    await myRedis.set(`cache:${interaction.guildId}:data`, JSON.stringify(guildData));
                } else {
                    guildData = {
                        owner_id: dbData.guilds.id,
                        tickets: {
                            category_id: dbData.tickets.category_id,
                            channel_id: dbData.guilds.ticket_channel_id,
                            channel_name: dbData.tickets.channel_name,
                            panel_description: dbData.tickets.panel_desc,
                            open_message: dbData.tickets.message,
                            allowed_mentions: dbData.tickets.allowed_mentions,
                            limit: dbData.tickets.limit
                        }
                    };
                };
            }
        } else {
            if (interaction.isRepliable()) await interaction.reply({
                content: "This interaction cannot be processed outside of a guild."
            });

            return;
        };

        console.log(member);

        switch (interaction.type) {

            // Handle Slash Commands Interaction
            case InteractionType.ApplicationCommand: {

                const command = client.commands.get(interaction.commandName);

                if (!command) return;

                try {
                    await command.execute(interaction as ChatInputCommandInteraction, member, client);
                } catch (error) {
                    Logger.error(`Unable to execute /${interaction.commandName}`, error as Error);
                }

                break;
            }

            // Handle Buttons and Select Menu Interactions
            case InteractionType.MessageComponent: {
                let component =
                    client.buttons.get(interaction.customId) ??
                    client.menus.get(interaction.customId);

                // If the component doesn't exist => return early
                if (!component) return;
                try {

                    const member = await new TargetUser(interaction.member as GuildMember).getCache(interaction.guild!);

                    if (!member) return;

                    if (
                        (interaction.isButton() && component instanceof ClientButton) ||
                        (interaction.isAnySelectMenu() && component instanceof ClientMenu)
                    ) {
                        await (
                            component as {
                                execute: (
                                    interaction:
                                        | ButtonInteraction
                                        | AnySelectMenuInteraction,
                                    member: CachedUser,
                                    client: ExtendedClient,
                                    guildData?: CachedGuild,
                                ) => Promise<
                                    Message<boolean> | InteractionResponse<boolean> | void
                                >;
                            }
                        ).execute(interaction, member, client, guildData);
                    }
                } catch (error) {
                    Logger.error(`Execution Error on ${interaction.customId}`, error as Error);
                }

                break;
            }

            // Handle Modal Submit Interactions
            case InteractionType.ModalSubmit: {
                const modal = client.modals.get(interaction.customId);
                if (!modal) return;

                const redisData = await myRedis.get(`cache:${interaction.guildId}:data`);

                if (!redisData || typeof redisData !== "string") return;

                const guildData = JSON.parse(redisData) as CachedGuild;
                try {
                    await modal.execute(interaction, member, client, guildData);
                } catch (error) {
                    Logger.error(`Unable to execute /${interaction.customId}`, error as Error);
                }

                break;
            }
        }
    }
}
