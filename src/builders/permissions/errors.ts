import { EmbedBuilder, MessageFlags, type InteractionReplyOptions } from "discord.js";
import removeWhitespace from "../../helpers/discord/removeWhitespace";

export const noAccessBuilder: InteractionReplyOptions = {
    embeds: [
        new EmbedBuilder()
            .setDescription(removeWhitespace(`
                **[-] You do not have access to this command!**
                › You're missing permissions to view the guild config.

                -# If you think you should have permission, the guild owner will need to whitelist you.
            `))
            .setColor("DarkRed")
    ],
    flags: MessageFlags.Ephemeral
};

export const cacheIssueBuilder: InteractionReplyOptions = {
    embeds: [
        new EmbedBuilder()
            .setDescription(removeWhitespace(`
                **[!] Sorry, an unexpected error has occurred!**
                › This error has occurred while fetching data in the cache.

                -# If this error persists, please contact our support team!
            `))
            .setFooter({
                text: "Please try again later!",
            })
            .setColor("DarkOrange")
            .setTimestamp()
    ],
    flags: MessageFlags.Ephemeral
}