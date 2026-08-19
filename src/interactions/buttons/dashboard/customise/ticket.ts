import { type ButtonInteraction, type CacheType, ChannelSelectMenuBuilder, ChannelType, type InteractionResponse, LabelBuilder, type Message, ModalBuilder, RoleSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { noAccessBuilder } from "../../../../builders/permissions/errors";
import { ClientButton } from "../../../../types/client";
import type { CachedGuild, CachedUser } from "../../../../types/redis";
import { permissionFlags } from "../../../../utils/constants/permissions";
import type { ExtendedClient } from "../../../../..";

export default class TicketCustomiseForm extends ClientButton {
    public override name: string = "tickets_customise";
    override async execute(interaction: ButtonInteraction<CacheType>, member: CachedUser, client: ExtendedClient, cachedGuild: CachedGuild): Promise<Message<boolean> | InteractionResponse<boolean> | void> {

        // Check if the user cannot access the dashboard
        if (member.permissions < permissionFlags.MANAGE_CONFIG) return await interaction.reply(noAccessBuilder);

        const modal = new ModalBuilder()
            .setCustomId("tickets_customise_form")
            .setTitle("✏️ : Edit Ticket Customisation")

            // Category Select
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("Ticket Category")
                    .setDescription("Where would you like your ticket channels to be created")
                    .setChannelSelectMenuComponent(
                        new ChannelSelectMenuBuilder()
                            .setChannelTypes(ChannelType.GuildCategory)
                            .setCustomId("category_id")
                            .setRequired(true)
                            .setMaxValues(1)
                            .setDefaultChannels(cachedGuild.tickets.category_id ? [cachedGuild.tickets.category_id] : [])
                            .setPlaceholder("📁  :  Please select a Category")
                            .setId(1)
                    )
            )

            // Channel Name Input
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("Channel Name")
                    .setDescription("This will be the name of the channel when a ticket is created.")
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId("channel_name")
                            .setPlaceholder("ticket-{user}")
                            .setValue(cachedGuild.tickets.channel_name)
                            .setMinLength(10)
                            .setMaxLength(500)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                            .setId(2)
                    )
            )

            // Open Message Input
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("Open Message")
                    .setDescription("The message sent to the user when they open a ticket (you may use discord markdown).")
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setCustomId("message")
                            .setValue(cachedGuild.tickets.open_message)
                            .setPlaceholder("📩 Please wait for our staff team to respond.")
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph)
                            .setId(3)
                    )
            )

            // Mention List
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("Ticket (Role) Mentions")
                    .setDescription("(Optional) Choose if role(s) should be pinged upon a ticket opening.")
                    .setRoleSelectMenuComponent(
                        new RoleSelectMenuBuilder()
                            .setCustomId("role_mentions")
                            .setPlaceholder("🛡️  :  Please select a role")
                            .setMinValues(1)
                            .setDefaultRoles([...cachedGuild.tickets.allowed_mentions?.roles ?? []])
                            // BUG: Discord modal bugs out if role select accepts more than 1 value
                            // BUG: Only occurs when the role select is the last element of the modal
                            // BUG: Discord issue, nothing I can do about it
                            // .setMaxValues(25)
                            .setRequired(false)
                            .setId(4)
                    )
            )

        await interaction.showModal(modal);
    }
}