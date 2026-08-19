import type { MessageMentionOptions, MessageMentionTypes, Snowflake } from "discord.js";

type CachedUser = {
    id: string;
    name: string;
    avatar: string;
    permissions: number;
    tickets: {
        open: number;
    }
};

type CachedGuild = {
    owner_id: string;
    tickets: {
        category_id: string | null;
        channel_id: string | null;
        channel_name: string;
        open_message: string;
        panel_description: string;
        allowed_mentions?: MessageMentionOptions;
        limit: number
    }
};

