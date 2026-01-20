import chalk, { Chalk, type ChalkInstance } from "chalk";

export enum LogType {
	INFO = "info",
	WARNING = "warning",
	CRITICAL = "critical",
	CLIENT = "client",
	DATABASE = "database",
	SYSTEM = "system",
}

export class Logger {
	private static readonly colours: Record<LogType, ChalkInstance> = {
		[LogType.INFO]: chalk.blue,
		[LogType.WARNING]: chalk.yellow,
		[LogType.CRITICAL]: chalk.red,
		[LogType.CLIENT]: chalk.magenta,
		[LogType.DATABASE]: chalk.green,
		[LogType.SYSTEM]: chalk.cyan,
	};

      /**
       * The current time (formatted locally)
       */
	private static get timestamp(): string {
		return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
	}

      /**
       * A simple divider to make the console more readable
       */
	private static get divider(): string {
		return chalk.gray(">>");
	}

      /**
       * Display a notification in the console
       * @param {LogType} type - The type of notification to display
       * @param {string} message - The notification to display
       */
	public static notification(type: LogType, message: string): void {
		const label = this.colours[type](type.toUpperCase());

		console.log(`${this.timestamp} | ${label} ${this.divider} ${message}`);
	}

      /**
       * Throw an error to the console
       * @param {string} message - The error message to display 
       * @param {Error} error - The error stack
       */
	public static error(message: string, error: Error): void {
		const label = this.colours[LogType.CRITICAL]("ERROR ");
            
            console.error(`${this.timestamp} | ${label} ${this.divider} ${message}`);

            if (error) console.error(chalk.dim(error.stack || error));

	}
}
