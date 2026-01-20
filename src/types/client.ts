import type { AnySelectMenuInteraction, ButtonInteraction, ChatInputCommandInteraction, ClientEvents, InteractionResponse, Message, ModalSubmitInteraction, SlashCommandBuilder } from "discord.js";
import type { ExtendedClient } from "../..";

export abstract class ClientEvent<T extends keyof ClientEvents> {
      public abstract name: T;
      public once?: boolean;
      public abstract execute(...args: [...ClientEvents[T], ExtendedClient]): Promise<Message<boolean> | void>
}

export abstract class ClientCommand {
      public abstract data: SlashCommandBuilder;
      public abstract execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<InteractionResponse<boolean> | void>
}

export abstract class ClientInteraction<T> {
      public abstract name: string;
      public abstract execute(interaction: T, client: ExtendedClient): Promise<Message<boolean> | InteractionResponse<boolean> | void>
}

export abstract class ClientButton extends ClientInteraction<ButtonInteraction> {};
export abstract class ClientMenu extends ClientInteraction<AnySelectMenuInteraction> {};
export abstract class ClientModal extends ClientInteraction<ModalSubmitInteraction> {};
