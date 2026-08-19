import { type ButtonInteraction, type CacheType, type Message, type InteractionResponse, ModalBuilder, LabelBuilder, ChannelSelectMenuBuilder, ChannelType, TextInputBuilder, TextInputStyle } from "discord.js";
import type { ExtendedClient } from "../../../../..";
import { ClientButton } from "../../../../types/client";
import type { CachedUser, CachedGuild } from "../../../../types/redis";
import { permissionFlags } from "../../../../utils/constants/permissions";
import { noAccessBuilder } from "../../../../builders/permissions/errors";

export default class PanelCustomiseForm extends ClientButton {
    public override name: string = "panel_customise";
    override async execute(interaction: ButtonInteraction<CacheType>, member: CachedUser, client: ExtendedClient, cachedGuild: CachedGuild): Promise<Message<boolean> | InteractionResponse<boolean> | void> {

        // Check if the user cannot access the dashboard
        if (member.permissions < permissionFlags.MANAGE_CONFIG) return await interaction.reply(noAccessBuilder);

        const modal = new ModalBuilder()
            .setCustomId("panel_customise_form")
            .setTitle("✏️ : Edit Panel Customisation")

            // Ticket Panel Selection
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("Ticket Panel Channel")
                    .setDescription("Which channel would you like to post your ticket panel?")
                    .setChannelSelectMenuComponent(
                        new ChannelSelectMenuBuilder()
                            .setChannelTypes(ChannelType.GuildText)
                            .setCustomId("channel_id")
                            .setRequired(true)
                            .setMaxValues(1)
                            .setDefaultChannels(cachedGuild.tickets.channel_id ? [cachedGuild.tickets.channel_id] : [])
                            .setPlaceholder("#  :  Please select a channel")
                            .setId(1)
                    )
            )
            // Panel Description
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("Panel Description")
                    .setDescription("What would you like your panel to say?")
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId("panel_description")
                            .setPlaceholder("If you wish to get in contact with our staff team, please click the button below.")
                            .setValue(cachedGuild.tickets.panel_description)
                            .setMinLength(10)
                            .setMaxLength(500)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                            .setId(2)
                    )
            )

        return await interaction.showModal(modal);
    };
}