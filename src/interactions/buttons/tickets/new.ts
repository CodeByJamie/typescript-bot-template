import { type ButtonInteraction, type CacheType, type Message, type InteractionResponse, MessageFlags, EmbedBuilder, Guild, ChannelType } from "discord.js";
import { myRedis, type ExtendedClient } from "../../../..";
import { ClientButton } from "../../../types/client";
import type { CachedUser, CachedGuild } from "../../../types/redis";
import removeWhitespace from "../../../helpers/discord/removeWhitespace";

export default class NewTicket extends ClientButton {
    public override name: string = "new_ticket";
    override async execute(interaction: ButtonInteraction<CacheType>, member: CachedUser, client: ExtendedClient, cachedGuild: CachedGuild): Promise<Message<boolean> | InteractionResponse<boolean> | void> {

        const guild = interaction.guild as Guild;

        // Check if the user already has an active ticket
        if (member.tickets.open >= 1) return await interaction.reply({
            flags: MessageFlags.Ephemeral,
            embeds: [
                new EmbedBuilder()
                    .setDescription(removeWhitespace(`
                    **[-] You have already opened a ticket**,
                    ${interaction.user.username}, you have already a ticket open, please return to this one before opening a new one.
                `))
                    .setColor("DarkOrange")
                    .setFooter({
                        text: "This is an automated system message",
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                    .setTimestamp()
            ]
        });

        const newChannel = await guild.channels.create({
            name: cachedGuild.tickets.channel_name,
            type: ChannelType.GuildText,
            reason: "Ticket Opened",
            permissionOverwrites: [
                {
                    id: interaction.guild!.id,
                    deny: "ViewChannel"
                },
                {
                    id: interaction.user.id,
                    allow: ["ViewChannel", "SendMessages", "EmbedLinks", "AttachFiles"]
                },
                ...(cachedGuild.tickets.allowed_mentions?.roles?.[0] ? [{
                    id: cachedGuild.tickets.allowed_mentions.roles[0],
                    allow: ["ViewChannel", "SendMessages", "EmbedLinks", "AttachFiles"] as const
                }] : [])
            ],
            parent: cachedGuild.tickets.category_id
        });

        await newChannel.send({
            content: `${(cachedGuild.tickets.allowed_mentions?.roles?.length ?? 0) > 0 ? `<@&${cachedGuild.tickets.allowed_mentions?.roles?.[0]}>` : ""}`,
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.guild!.name} | Ticket Support`,
                        iconURL: interaction.guild!.iconURL() ?? ""
                    })
                    .setDescription(removeWhitespace(`
                        ${cachedGuild.tickets.open_message}    
                    `))
                    .setFooter({
                        text: `Created by ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp()
                    .setColor("Green")
            ],
            allowedMentions: {
                ...(cachedGuild.tickets.allowed_mentions ?? {}),
                users: [
                    ...(cachedGuild.tickets.allowed_mentions?.users ?? []),
                    interaction.user.id
                ]
            }
        })

    }
}