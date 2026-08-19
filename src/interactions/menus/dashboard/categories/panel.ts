import { type InteractionResponse, type Message, type MessageActionRowComponentBuilder, type StringSelectMenuInteraction, ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuComponent } from "discord.js";
import type { ExtendedClient } from "../../../../..";
import removeWhitespace from "../../../../helpers/discord/removeWhitespace";
import { ClientMenu } from "../../../../types/client";
import type { CachedGuild, CachedUser } from "../../../../types/redis";

export default class PanelCustomisation extends ClientMenu {
    public override name: string = "panel";
    override async execute(interaction: StringSelectMenuInteraction, member: CachedUser, client: ExtendedClient, cachedGuild: CachedGuild): Promise<Message<boolean> | InteractionResponse<boolean> | void> {

        const { tickets } = cachedGuild;

        await interaction.update({});

        return await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.guild?.name} | Dashboard - Panel`,
                        iconURL: interaction.guild?.iconURL()!
                    })
                    .setDescription(removeWhitespace(`
                    Review the guild's __panel configuration__ and if you need to edit anything, you can use the button below.

                    › **Panel Channel**:
                    ${tickets.channel_id ? `<#${tickets.channel_id}>` : "Not Selected"}

                    › **Panel Description**:
                    ${tickets.panel_description}
                `))
                    .setColor("DarkAqua")
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
                        .setCustomId("panel_customise")
                        .setLabel("Edit Configuration")
                        .setStyle(ButtonStyle.Primary),

                    ...(cachedGuild.tickets.channel_id && cachedGuild.tickets.panel_description && cachedGuild.tickets.category_id ? [new ButtonBuilder()
                        .setCustomId("panel_send")
                        .setLabel("Send Panel to Channel ↗")
                        .setStyle(ButtonStyle.Secondary)] : [])
                )
            ],
        });
    }
}