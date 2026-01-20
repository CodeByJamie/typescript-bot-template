import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ClientCommand } from "../types/client";
import type { ExtendedClient } from "../..";

export default class PingCommand extends ClientCommand {
    override data = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("ping pong!");

    override async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
        await interaction.reply({
            content: `Ping! ${client.ws.ping}ms!`
        });
    }
}