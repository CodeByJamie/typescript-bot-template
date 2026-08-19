import { EmbedBuilder, GuildMember, type CacheType, type InteractionResponse, type Message, type ModalSubmitInteraction, type SelectMenuModalData, type TextInputModalData } from "discord.js";
import { myRedis, type ExtendedClient } from "../../../..";
import { noAccessBuilder } from "../../../builders/permissions/errors";
import removeWhitespace from "../../../helpers/discord/removeWhitespace";
import { ClientModal } from "../../../types/client";
import type { CachedGuild, CachedUser } from "../../../types/redis";
import { permissionFlags } from "../../../utils/constants/permissions";
import { sleep } from "bun";

export default class DashboardSubmitTicket extends ClientModal {
    public override name: string = "tickets_customise_form";
    override async execute(interaction: ModalSubmitInteraction<CacheType>, member: CachedUser, client: ExtendedClient, cachedGuild: CachedGuild): Promise<Message<boolean> | InteractionResponse<boolean> | void> {

        // Check if the user cannot access the dashboard
        if (member.permissions < permissionFlags.MANAGE_CONFIG) return await interaction.reply(noAccessBuilder);

        const fields = interaction.fields.fields;

        // Set the new redis key
        await myRedis.set(`cache:${interaction.guildId}:data`, JSON.stringify({
            ...cachedGuild,
            tickets: {
                ...cachedGuild.tickets,
                category_id: (fields.get("category_id") as SelectMenuModalData).values[0],
                channel_name: (fields.get("channel_name") as TextInputModalData).value,
                open_message: (fields.get("message") as TextInputModalData).value,
                allowed_mentions: {
                    ...cachedGuild.tickets.allowed_mentions,
                    roles: (fields.get("role_mentions") as SelectMenuModalData).values ?? []
                }
            }
        }));

        const msg = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(removeWhitespace(`
                    **Successfully updated the configuration for the __tickets__ category.**
                    You should see the update in your guild dashboard. 
                `))
                    .setColor("Green")
                    .setFooter({
                        text: `Updated by ${interaction.user.username} (${(interaction.member as GuildMember).roles.highest.name})`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp()
            ]
        });

        await sleep(5000);

        await msg.delete();
    }
}