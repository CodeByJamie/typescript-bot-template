import { Logger, LogType } from "../../utils/logger";

// https://docs.discord.com/developers/reference#snowflakes
export const DISCORD_EPOCH = 1420070400000n;

/**
 * Validate a string to see if it is a discord snowflake
 * @link https://docs.discord.com/developers/reference#snowflakes
 * @param {string} snowflake - The string to validate
 * @returns Whether the input is a snowflake or not
 */

export function validateSnowflake(snowflake: string): boolean {

    // Validate the length of the inputted string
    if (!/\d{17,20}/.test(snowflake)) return false;

    try {
        // Convert input to bigInt to prevent precision loss
        const snowflakeInt = BigInt(snowflake);

        // Timestamp is stored in the first 42bits, so shift to the right by 22 bits
        const timestamp = (snowflakeInt >> 22n) + DISCORD_EPOCH;

        // Check if the snowflake timestamp was created before discord launched
        // Check if the timestamp is in the future
        if (timestamp < DISCORD_EPOCH || timestamp > BigInt(Date.now())) return false;

        return true;
    } catch (error) {

        // Catch where bigint parsing fails
        Logger.notification(LogType.WARNING, "Failed to parse a string into BigInt");
        console.error(error);

        return false;
    }
}