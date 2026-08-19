import { EmbedBuilder, GuildMember, type InteractionResponse, type Message, MessageFlags, StringSelectMenuInteraction } from "discord.js";
import removeWhitespace from "../../../../helpers/discord/removeWhitespace";
import { ClientMenu } from "../../../../types/client";
import type { CachedGuild, CachedUser } from "../../../../types/redis";
import type { ExtendedClient } from "../../../../..";
import { permissionFlags } from "../../../../utils/constants/permissions";
import { noAccessBuilder } from "../../../../builders/permissions/errors";
import { TargetUser } from "../../../../helpers/redis/user/targetUser";

export default class DashboardCategoryMenu extends ClientMenu {
    public override name: string = "dash_category";
    public override async execute(interaction: StringSelectMenuInteraction, member: CachedUser, client: ExtendedClient, cachedGuild: CachedGuild): Promise<Message<boolean> | InteractionResponse<boolean> | void> {

        // Check if the user doesn't have the correct permissions
        if ((await (new TargetUser(interaction.member as GuildMember).getPermissions(interaction.guild!)) ?? 0) < permissionFlags.MANAGE_CONFIG) return await interaction.reply(noAccessBuilder);

        try {
            const module = client?.menus.get(interaction.values[0]!);
            await module?.execute(interaction, member, client, cachedGuild);
        } catch (error) {
            console.error(error);
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(removeWhitespace(`
                        **Sorry, I could not access the __${interaction.values[0]}__ category as an unexpected error occurred.**
                        If this error persists, please let a member of our support team know!
                    `))
                        .setColor("DarkOrange")
                        .setFooter({
                            text: "This is an automatic system message",
                        })
                        .setTimestamp()
                ],
                flags: MessageFlags.Ephemeral
            })
        }
    };
};