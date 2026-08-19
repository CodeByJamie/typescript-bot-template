import { RedisClient } from "bun";
import { Logger, LogType } from "../../utils/logger";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

export class CoreClient {

    /**
     * Connect to the redis server
     * @returns The successful redis connection
     */
    public async RedisConnect(): Promise<RedisClient> {

        // Define the new redis client
        const client = new RedisClient(process.env.REDIS_URL);
        try {
            await client.connect();
            Logger.notification(LogType.DATABASE, "Successfully connected to the redis application!")

        } catch (error) {
            Logger.error("Failed to connect to the redis server", error as Error);
            console.error(error);
            process.exit(1);
        };

        return client;
    };

    /**
     * Close the redis server
     * @param client - The redis application to close
     */
    public static RedisClose(client: RedisClient): void {
        try {
            return client.close();
        } catch (error) {
            Logger.error("Failed to disconnect from the redis server", error as Error);
            console.error(error);
        };

        return;

    };

    /**
     * Connect to the database
     * @returns The database connection
     */
    public DatabaseConnect(): NeonHttpDatabase {
        try {
            const database = drizzle(neon(process.env.DATABASE_URL!));
            Logger.notification(LogType.DATABASE, "Successfully connected to the database!");
            return database;
        } catch (error) {
            Logger.error("Failed to establish a database connection", error as Error);
            console.error(error);
            process.exit(1);
        }
    }
};

