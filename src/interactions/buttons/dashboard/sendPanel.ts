import { type ButtonInteraction, type CacheType, type Message, type InteractionResponse, MessageFlags, EmbedBuilder, type GuildTextBasedChannel, ActionRowBuilder, type MessageActionRowComponentBuilder, ButtonBuilder, ButtonStyle, Embed } from "discord.js";
import type { ExtendedClient } from "../../../..";
import { ClientButton } from "../../../types/client";
import type { CachedUser, CachedGuild } from "../../../types/redis";
import removeWhitespace from "../../../helpers/discord/removeWhitespace";
import { permissionFlags } from "../../../utils/constants/permissions";
import { noAccessBuilder } from "../../../builders/permissions/errors";
import { Logger } from "../../../utils/logger";

export default class SendPanel extends ClientButton {
    public override name: string = "panel_send";
    override async execute(interaction: ButtonInteraction<CacheType>, member: CachedUser, client: ExtendedClient, cachedGuild: CachedGuild): Promise<Message<boolean> | InteractionResponse<boolean> | void> {

        // Check if the user doesn't have the correct permissions
        if (member.permissions < permissionFlags.MANAGE_CONFIG) return await interaction.reply(noAccessBuilder);

        // Check if the channel_id is not configured
        if (!cachedGuild.tickets.channel_id || !cachedGuild.tickets.panel_description) return await interaction.reply({
            flags: MessageFlags.Ephemeral,
            embeds: [
                new EmbedBuilder()
                    .setDescription(removeWhitespace(`
                        **[-] Unable to send panel component!**
                        You have not configured the panel correctly, please review this category in your dashboard.

                        - ${Boolean(cachedGuild.tickets.channel_id) ? "✔" : "✖"} Panel Channel
                        - ${Boolean(cachedGuild.tickets.open_message) ? "✔" : "✖"} Open Message
                `))
                    .setColor("DarkOrange")
                    .setFooter({
                        text: "This is an automated system message",
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                    .setTimestamp()
            ]
        });

        // Extract the channel_id from the guild data to use it locally (mostly for readability)
        const targetChannelId = cachedGuild.tickets.channel_id;

        // Define a channel object of the target channel
        let channelObject: GuildTextBasedChannel;

        try {
            const targetChannel = await interaction.guild?.channels.fetch(targetChannelId);

            // Check if target channel is a falsy value or it doesn't exist
            if (!targetChannel) return await interaction.reply({
                flags: MessageFlags.Ephemeral,
                embeds: [
                    new EmbedBuilder()
                        .setDescription(removeWhitespace(`
                            **[-] Could not find guild channel**
                            I was unable to find the channel with the id ➜ __"${targetChannelId}"__. Please ensure you have configured this id correctly in the dashboard.
                    `))
                        .setColor("DarkOrange")
                        .setFooter({
                            text: "This is an automated system message",
                            iconURL: interaction.client.user.displayAvatarURL()
                        })
                        .setTimestamp()
                ]
            });

            channelObject = targetChannel as GuildTextBasedChannel;
        } catch (error) {
            Logger.error(`[sendPanel.ts]: Failed to fetch target channel (${targetChannelId})`, error as Error);
            return await interaction.reply({
                flags: MessageFlags.Ephemeral,
                embeds: [
                    new EmbedBuilder()
                        .setDescription(removeWhitespace(`
                            **[!] Oops, an unexpected error occurred...**
                            Sorry, an unexpected error on our side occurred when retrieving the configured panel channel.

                            -# If this issue persists, please contact a member of our Support Team!
                        `))
                        .setColor("Red")
                        .setFooter({
                            text: "This is an automated system message",
                            iconURL: interaction.client.user.displayAvatarURL()
                        })
                        .setTimestamp()
                ]
            })
        };

        // Attempt to send all the messages to discord
        try {
            await channelObject.send({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.guild?.name} Ticket Panel`,
                            iconURL: interaction.guild?.iconURL() ?? interaction.client.user.displayAvatarURL()
                        })
                        .setDescription(removeWhitespace(`
                    ${cachedGuild.tickets.panel_description}
                `))
                        .setColor("Green")
                ],
                components: [
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId("new_ticket")
                            .setLabel("📩 Create ticket")
                            .setStyle(ButtonStyle.Secondary)
                    )
                ]
            });

            return await interaction.reply({
                flags: MessageFlags.Ephemeral,
                embeds: [
                    new EmbedBuilder()
                        .setDescription(removeWhitespace(`
                        **✔ Successfully sent ticket panel**
                        Your ticket panel has successfully been sent to <#${targetChannelId}>
                    `))
                        .setColor("Green")
                ]
            })
        } catch (error) {
            Logger.error("[sendPanel]: Failed to process discord message replies", error as Error);
            console.error(error);
            return await interaction.reply({
                flags: MessageFlags.Ephemeral,
                embeds: [
                    new EmbedBuilder()
                        .setDescription(removeWhitespace(`
                        [!] **Unable to send panel to <#${targetChannelId}>**,
                        We're sorry, there was an unexpected error that has occurred on our side - this has been logged.

                        -# If this error persists, please contact a member of our Support Team!
                    `))
                        .setColor("Red")
                        .setFooter({
                            text: "This is an automated system message",
                            iconURL: interaction.client.user.displayAvatarURL()
                        })
                        .setTimestamp()
                ]
            })
        }


    }
}