/**
 * Validate the source env file
 */

import { Logger, LogType } from "../../utils/logger";

export default function ValidateEnv(): void {
    const { NODE_ENV, CLIENT_TOKEN, DATABASE_URL, REDIS_URL } = process.env;

    if (!CLIENT_TOKEN) return fail("CLIENT_TOKEN");
    if (!DATABASE_URL) return fail("DATABASE_URL");
    if (!REDIS_URL) return fail("REDIS_URL");
    
    Logger.notification(LogType.INFO, `Environment running in ${NODE_ENV}.`);

};

const fail = (variable: string): void => {
    Logger.notification(LogType.CRITICAL, `${variable} is not defined in the environments.`);
    process.exit(1);
};