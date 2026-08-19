import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type Guild, inlineCode, type InteractionResponse, type Message, type MessageActionRowComponentBuilder, StringSelectMenuComponent, StringSelectMenuInteraction } from "discord.js";
import { ExtendedClient } from "../../../../..";
import removeWhitespace from "../../../../helpers/discord/removeWhitespace";
import { ClientMenu } from "../../../../types/client";
import type { CachedGuild, CachedUser } from "../../../../types/redis";


export default class TicketCustomisation extends ClientMenu {
    public override name: string = "tickets";
    override async execute(interaction: StringSelectMenuInteraction, member: CachedUser, client: ExtendedClient, cachedGuild: CachedGuild): Promise<Message<boolean> | InteractionResponse<boolean> | void> {
        
        const guild = interaction.guild as Guild;

        // Extract the allowed mentions object
        const allowedMentions = cachedGuild.tickets.allowed_mentions;

        // Filter out the "parse" key, as I don't need it on the embed
        const keys = allowedMentions
            ? (Object.keys(allowedMentions) as (keyof typeof allowedMentions)[]).filter(k => k !== "parse")
            : [];

        // Update interaction state
        await interaction.update({});

        // Construct fields cleanly (filtering out empty IDs)
        const fields = keys
            .map((key) => {
                const ids = (allowedMentions?.[key] as string[] | undefined) ?? [];
                // Return null for empty sets
                if (ids.length === 0) return null;

                let formattedValue = "None";

                switch (key) {
                    case "users":
                        formattedValue = ids.map((id) => `<@${id}>`).join(", ");
                        break;
                    case "roles":
                        formattedValue = ids.map((id) => `<@&${id}>`).join(", ");
                        break;
                    default:
                        formattedValue = ids.join(", ");
                        break;
                }

                return {
                    name: key.charAt(0).toUpperCase() + key.slice(1),
                    value: formattedValue,
                    inline: true,
                };
            })
            .filter((field): field is { name: string; value: string; inline: boolean } => field !== null);
        return await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${guild.name} | Dashboard - Tickets`,
                        iconURL: guild.iconURL() ?? ""
                    })
                    .setDescription(removeWhitespace(`
                                Review the guild's __ticket configuration__ and if you need to edit any setting, please use the button below.

                                › **Category**:
                                ${cachedGuild.tickets.category_id ? `<#${cachedGuild.tickets.category_id}>` : "Not Selected"}

                                › **Channel Name**: 
                                ${inlineCode(cachedGuild.tickets.channel_name)}
                                
                                › **Open Message**:
                                ${cachedGuild.tickets.open_message}

                                ${fields.length > 0 ? " › **Mentions**:" : ""}
                            `))
                    .addFields(fields)
                    .setColor("Blurple")
                    .setFooter({
                        text: `Last reviewed by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp()
            ],
            components: [
                interaction.message.components[0] as ActionRow<StringSelectMenuComponent>,
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("tickets_customise")
                        .setLabel("Edit Configuration")
                        .setStyle(ButtonStyle.Primary),
                ),
            ]
        });


    }
}