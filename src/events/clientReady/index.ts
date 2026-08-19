import { ActivityType, Events, type Client } from "discord.js";
import { ClientEvent } from "../../types/client";
import { Logger, LogType } from "../../utils/logger";
import config from "../../core/config.json"

export default class extends ClientEvent<Events.ClientReady> {
    name = Events.ClientReady as const;
    override once = true;

    async execute(client: Client<true>) {

        // TODO: Spawn background worker thread
        client.user.setActivity({
            name: `Running on v${config.version} ${process.env.NODE_ENV?.toLowerCase()}`,
            type: ActivityType.Playing,
        });

        client.user.setStatus("idle");

        Logger.notification(LogType.CLIENT, `Successfully logged in as ${client.user.username}! 💖`);


    };
}
