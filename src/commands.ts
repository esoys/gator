import { Config, setUser, readConfig } from "./config.ts";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;
export type CommandRegistry = Record<string, CommandHandler>;


export function handlerLogin(cmdName: string, ...args: string[]): void {
    if (args.length === 0) {
        throw new Error("exactly one argument (username) is expected");
    } else {
        const userName = args[0];
        setUser(userName);
        console.log(`User has been set: ${userName}`);
    };
};


export function registerCommand(registry: CommandRegistry, cmdName: string, handler: CommandHandler): void {
    registry[cmdName] = handler;  
};


export function runCommand(registry: CommandRegistry, cmdName: string, ...args: string[]): void {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unkwon command: ${cmdName}`);
    } else {
        handler(cmdName, ...args);
    };
};
