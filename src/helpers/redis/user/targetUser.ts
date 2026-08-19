import { GuildMember, type Guild, type User } from "discord.js";
import { myRedis } from "../../../..";
import { permissionFlags } from "../../../utils/constants/permissions";
import { validateSnowflake } from "../../discord/validateSnowflake";
import { Logger, LogType } from "../../../utils/logger";
import type { CachedUser } from "../../../types/redis";

export class TargetUser {

    public member: GuildMember | User;

    // Save the member data into the class
    constructor(member: GuildMember | User) {
        this.member = member;
    };

    /**
     * Get the permissions of a user from a specific guild
     * @param {Guild} guild - The guild to search the permissions from
     */
    public async getPermissions(guild: Guild): Promise<number | null> {

        // Check if guild.id is malformed in anyway
        if (!validateSnowflake(guild.id)) {
            Logger.notification(LogType.WARNING, `Guild (id: ${guild.id} | name: ${guild.name}) ID is not a valid snowflake.`);
            return null;
        };

        // Check if the member is not a GuildMember
        if (!(this.member instanceof GuildMember)) {
            Logger.notification(LogType.WARNING, `Member is not in Guild.`);
            return null;
        }

        // Attempt to fetch the data from the cache
        try {
            const cachedData = await this.getCache(guild);

            // Check if the data is NULL => also return null
            if (!cachedData) return null;

            return cachedData.permissions;

        } catch (error) {
            Logger.error(`(UserPermissions.get()): Failed to fetch guild ("${guild.id}") from the cache`, error as Error);
            console.log(error);
            return null;
        };
    };

    public async getCache(guild: Guild): Promise<CachedUser | null> {

        let data: CachedUser;

        // Attempt to fetch the data from the cache
        try {

            // DEBUG
            await myRedis.del(`cache:${guild.id}:user:${this.member.id}`);
            const redisData = await myRedis.get(`cache:${guild.id}:user:${this.member.id}`);

            // If redis data is null => create a new key
            if (!redisData) {

                let permissions = 0;

                if (guild.ownerId === this.member.id) permissions = permissionFlags.MANAGE_CONFIG;

                data = {
                    id: this.member.id,
                    name: this.member.displayName,
                    avatar: this.member.displayAvatarURL(),
                    permissions,
                    tickets: {
                        open: 0
                    }
                };

                await myRedis.set(`cache:${guild.id}:user:${this.member.id}`, JSON.stringify(data));

                console.log(data);
                
                return data;
            };

            // Attempt to parse the cached data
            try {
                data = JSON.parse(redisData);
            } catch (error) {
                Logger.error(`Failed to parse redis user data`, error as Error);
                return null;
            };

            return data;


        } catch (error) {
            Logger.error("Failed to fetch data from the redis cache", error as Error);
            return null;
        }
    }

};