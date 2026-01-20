import { Glob } from "bun";
import {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
    REST,
    Routes,
    type BitFieldResolvable,
    type ClientEvents,
} from "discord.js";
import path from "node:path";
import { ClientEvent, type ClientButton, type ClientCommand, type ClientMenu, type ClientModal } from "./src/types/client";
import { Logger, LogType } from "./src/utils/logger";

export class ExtendedClient extends Client {
    public commands = new Collection<string, ClientCommand>();
    public buttons = new Collection<string, ClientButton>();
    public menus = new Collection<string, ClientMenu>();
    public modals = new Collection<string, ClientModal>();

    // Construct the intents & partials of the client
    constructor() {
        super({
            intents: Object.keys(GatewayIntentBits).filter((intent) => isNaN(Number(intent))) as unknown as BitFieldResolvable<
                keyof typeof GatewayIntentBits,
                number
            >,
            partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember],
        });
    }

    private async loadModules(): Promise<void> {
        // Construct the path to the src directory
        const srcPath = path.join(process.cwd(), "src");

        // Create a new search pattern to search in all the modules to load
        const glob = new Glob("{commands,events,interactions}/**/*.ts");

        // Fetch all the files from scan
        const files = await Array.fromAsync(glob.scan({ cwd: srcPath }));

        // Check if no files have been added
        if (files.length === 0) {
            Logger.notification(LogType.CRITICAL, "No files were found in any of the specified modules.");
            process.exit(1);
        }

        // Purely for logging purposes
        let totalModules: number = 0;

        // Process all files in parallel (saves time)
        await Promise.all(
            files.map(async (file) => {
                const formattedPath = file.replaceAll(/\\/g, "/");

                // Construct the path to the module
                const filePath = path.join(srcPath, formattedPath);
                // Import the module
                const module = await import(filePath);
                const component = module.default;

                // Check the imported module is a class constructor
                if (!component || typeof component !== "function")
                    return Logger.notification(
                        LogType.WARNING,
                        `Failed to load ${filePath} as does not follow the correct structure.`,
                    );

                // Create a new instance of the class
                const instance: ClientCommand | ClientButton | ClientEvent<keyof ClientEvents> | ClientModal | ClientMenu =
                    new component();

                if (typeof instance.execute !== "function")
                    return Logger.notification(LogType.WARNING, `${file} is missing the "execute" attribute.`);

                // Determine the category based on the folder path
                const [category, subCategory] = formattedPath.split("/");

                switch (category) {
                    case "events": {
                        // Map the events to the collection using the specific djs event
                        const event = instance as ClientEvent<keyof ClientEvents>;

                        if (!event.name) return Logger.notification(LogType.WARNING, `${file} is missing the "name" attribute.`);
                        const handler = (...args: ClientEvents[keyof ClientEvents]) => event.execute(...args, this);

                        // Register the event onto the client
                        event.once ? this.once(event.name, handler) : this.on(event.name, handler);

                        totalModules++;
                        break;
                    }

                    case "commands": {
                        // Map the slash commands to the collection using their specified name
                        const command = instance as ClientCommand;

                        // Check if the command has all the required attributes
                        if (!command.data) return Logger.notification(LogType.WARNING, `${file} is missing the "data" attribute.`);

                        this.commands.set(command.data.name, command);

                        totalModules++;
                        break;
                    }

                    case "interactions": {
                        // Set the correct sub-collection
                        const key = subCategory as "buttons" | "menus" | "modals";
                        const collection = this[key];
                        const interaction = instance as ClientButton & ClientMenu & ClientModal;

                        if (!interaction.name) return Logger.notification(LogType.WARNING, `${file} is missing the "name" attribute.`);

                        // Save the instance using the custom id of the interaction
                        if (collection instanceof Collection) {
                            collection.set(interaction.name, interaction);
                            totalModules++;
                        }

                        break;
                    }
                }
            }),
        );

        Logger.notification(LogType.SYSTEM, `Cached ${this.commands.size} commands.`);
        Logger.notification(LogType.SYSTEM, `Cached ${this.buttons.size + this.menus.size + this.modals.size} interactions.`);
        Logger.notification(LogType.SYSTEM, `Successfully loaded ${totalModules}/${files.length} modules.`);
    }

    private async registerCommands(): Promise<void> {
        // Check if there are no commands to register
        if (this.commands.size === 0) return Logger.notification(LogType.WARNING, "There are no commands available to register.");

        // Initalise a new REST object
        const rest = new REST({ version: "10" }).setToken(Bun.env.CLIENT_TOKEN!);

        try {
            // Covert the command data to JSON
            const body = this.commands.map((command) => command.data.toJSON());

            // Push the data onto the client
            await rest.put(Routes.applicationCommands(this.user!.id), { body });

            Logger.notification(LogType.CLIENT, `Successfully registered ${this.commands.size} commands onto the client.`);
        } catch (error) {
            Logger.error("Failed to register commands.", error as Error);
        }
    }

    // Start function for the client
    public async start(): Promise<void> {

        const startTime = Date.now();

        // Check if the environmental variables have not been setup
        if (!Bun.env.CLIENT_TOKEN) {
            Logger.notification(
                LogType.CRITICAL,
                "Please ensure all necessary environmental variables are setup before running the process.",
            );
            process.exit(1);
        }

        try {
            Logger.notification(LogType.CLIENT, "Successfully initialised the client.");

            // Load all of the modules
            await this.loadModules();

            // Attempt to login to the client
            try {
                await this.login(Bun.env.CLIENT_TOKEN!);
                Logger.notification(LogType.CLIENT, "Client has successfully logged in.");
            } catch (error) {
                Logger.error("Failed to login to the client.", error as Error);
                process.exit(1);
            }

            // Register all the available commands
            await this.registerCommands();
        } catch (error) {
            Logger.error("Failed to start the client.", error as Error);
            process.exit(1);
        }

        console.log(`Startup time: ${Date.now() - startTime}ms`);
    }
}

new ExtendedClient().start();