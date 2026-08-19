import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Events,
    InteractionResponse,
    InteractionType,
    Message,
    type AnySelectMenuInteraction,
    type Interaction,
} from "discord.js";
import { ExtendedClient } from "../../..";
import { Logger } from "../../utils/logger";
import { ClientButton, ClientEvent, ClientMenu } from "../../types/client";

export default class extends ClientEvent<Events.InteractionCreate> {
    name = Events.InteractionCreate as const;

    async execute(interaction: Interaction, client: ExtendedClient) {
        switch (interaction.type) {

            // Handle Slash Commands Interaction
            case InteractionType.ApplicationCommand: {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await command.execute(interaction as ChatInputCommandInteraction, client);
                } catch (error) {
                    Logger.error(`Unable to execute /${interaction.commandName}`, error as Error);
                }

                break;
            }

            // Handle Buttons and Select Menu Interactions
            case InteractionType.MessageComponent: {
                let component =
                    client.buttons.get(interaction.customId) ??
                    client.menus.get(interaction.customId);

                if (!component) return;
                try {
                    if (
                        (interaction.isButton() && component instanceof ClientButton) ||
                        (interaction.isAnySelectMenu() && component instanceof ClientMenu)
                    )
                        await (
                            component as {
                                execute: (
                                    interaction:
                                        | ButtonInteraction
                                        | AnySelectMenuInteraction,
                                    client: ExtendedClient,
                                ) => Promise<
                                    Message<boolean> | InteractionResponse<boolean> | void
                                >;
                            }
                        ).execute(interaction, client);
                } catch (error) {
                    Logger.error(`Execution Error on ${interaction.customId}`, error as Error);
                }

                break;
            }

            // Handle Modal Submit Interactions
            case InteractionType.ModalSubmit: {
                const modal = client.modals.get(interaction.customId);
                if (!modal) return;

                try {
                    await modal.execute(interaction, client);
                } catch (error) {
                    Logger.error(`Unable to execute /${interaction.customId}`, error as Error);
                }

                break;
            }
        }
    }
}
