import { Config, setUser, readConfig } from "./config.ts";
import { getUser, createUser, resetDb, listUsers } from "./lib/db/queries/users.ts";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandRegistry = Record<string, CommandHandler>;


export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) {
        throw new Error("exactly one argument (username) is expected");
    } else {
        const userName = args[0];
        const existingUser = await getUser(userName);
        if (!existingUser) {
            throw new Error(`User ${userName} not found`);
        }

        setUser(existingUser.name);
        console.log("User switched successfully!");
    };
};


export async function register(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) { throw new Error(`usage: ${cmdName} <name>`) };
    const name = args[0];

    const user = await getUser(name);
    if (user) {
        throw new Error("User already exists");
    } else {
        const created = await createUser(name); 
        setUser(created.name);
        console.log(`Created User: ${created}`);
    }
};


export async function getUsers(cmdName: string, ...args: string[]) {
    if (args.length !== 0) {
        throw new Error(`usage: only command without additional arguments`);
    }
    const users = await listUsers();
    const currentUser = readConfig().currentUserName; 

    for (const user of users) {
        if (user.name === currentUser) {
            console.log(`- '${user.name} (current)'`);
            continue;
        };
        console.log(`- '${user.name}'`);
    }
};



export async function reset(cmdName: string, ...args: string[]) {
    await resetDb();
    console.log("DB has been reset");
};



export async function registerCommand(registry: CommandRegistry, cmdName: string, handler: CommandHandler): Promise<void> {
    registry[cmdName] = handler;  
};


export async function runCommand(registry: CommandRegistry, cmdName: string, ...args: string[]): Promise<void> {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error(`Unkwon command: ${cmdName}`);
    } else {
        await handler(cmdName, ...args);
    };
};


