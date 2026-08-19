import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildMember, InteractionResponse, type MessageActionRowComponentBuilder, MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import type { ExtendedClient } from "../../..";
import removeWhitespace from "../../helpers/discord/removeWhitespace";
import { TargetUser } from "../../helpers/redis/user/targetUser";
import { ClientCommand } from "../../types/client";
import { permissionFlags } from "../../utils/constants/permissions";
import { cacheIssueBuilder, noAccessBuilder } from "../../builders/permissions/errors";
import type { CachedUser } from "../../types/redis";

export default class DashboardConfig extends ClientCommand {
    public override data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName("dashboard")
        .setDescription("Review the config for this guild");

    override async execute(interaction: ChatInputCommandInteraction, member: CachedUser): Promise<InteractionResponse<boolean> | void> {

        const guild = interaction.guild;

        // Check if member is null or the variable does not match the discord member instance
        if (!guild || !(guild instanceof Guild)) return;

        // Check if the users permissions is less than the required permission
        if (member.permissions < permissionFlags.MANAGE_CONFIG) return await interaction.reply(noAccessBuilder);

        // if user has permission => show the home page of the dashboard
        const dashboardBuilder = {
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${guild.name} | Dashboard - Home`,
                        iconURL: guild.iconURL() ?? ""
                    })
                    .setDescription(removeWhitespace(`
                        Welcome to the home page of the dashboard; Below is a list of categories that you can customise to fit your preference!
                        
                        __**Tickets**__
                        › **Channel Name**: Edit the name of the channel when a new ticket is created.
                        › **Open Message**: Edit the message users receive when they open a ticket.
                        › **Role Mention**: Select a role to be mentioned when a user opens a ticket.
                        
                        __**Panel**__
                        › **Panel Channel**: Select the channel where you want the panel to be posted.
                        › **Description**: The message you want users to see on your panel.
                    `))
                    .setColor("Green")
            ],
            components: [
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    new StringSelectMenuBuilder()
                        .setPlaceholder("✏️ : Which category would you like to customise?")
                        .setCustomId("dash_category")
                        .addOptions([
                            {
                                label: "Tickets",
                                value: "tickets",
                                emoji: {
                                    name: "🔓"
                                }
                            },
                            {
                                label: "Panel",
                                value: "panel",
                                emoji: {
                                    name: "📄"
                                }
                            },
                        ])
                )
            ]
        }

        return await interaction.reply(dashboardBuilder);
    }

}