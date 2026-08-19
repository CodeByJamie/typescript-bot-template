import { Events, type Client } from "discord.js";
import { ClientEvent } from "../../types/client";
import { Logger, LogType } from "../../utils/logger";

export default class extends ClientEvent<Events.ClientReady> {
	name = Events.ClientReady as const;
	override once = true;

	async execute(client: Client<true>) {
		Logger.notification(LogType.CLIENT, `Successfully logged in as ${client.user.username}! 💖`);
	}
}
