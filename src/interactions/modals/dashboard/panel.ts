import { type ModalSubmitInteraction, type CacheType, type Message, type InteractionResponse, type SelectMenuModalData, type TextInputComponentData, EmbedBuilder, GuildMember } from "discord.js";
import { myRedis, type ExtendedClient } from "../../../..";
import { ClientModal } from "../../../types/client";
import type { CachedUser, CachedGuild } from "../../../types/redis";
import { permissionFlags } from "../../../utils/constants/permissions";
import { noAccessBuilder } from "../../../builders/permissions/errors";
import removeWhitespace from "../../../helpers/discord/removeWhitespace";
import { sleep } from "bun";

export default class DashboardSubmitPanel extends ClientModal {
    public override name: string = "panel_customise_form";
    override async execute(interaction: ModalSubmitInteraction<CacheType>, member: CachedUser, client: ExtendedClient, cachedGuild: CachedGuild): Promise<Message<boolean> | InteractionResponse<boolean> | void> {

        // Check if the user doesn't have the correct permissions
        if (member.permissions < permissionFlags.MANAGE_CONFIG) return await interaction.reply(noAccessBuilder);

        const fields = interaction.fields.fields;

        // Set the new redis key
        await myRedis.set(`cache:${interaction.guildId}:data`, JSON.stringify({
            ...cachedGuild,
            tickets: {
                ...cachedGuild.tickets,
                channel_id: (fields.get("channel_id") as SelectMenuModalData).values[0],
                panel_description: (fields.get("panel_description") as TextInputComponentData).value,
            }
        }));

        const msg = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(removeWhitespace(`
                    **Successfully updated the configuration for the __panel__ category.**
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

        return;

    };
}