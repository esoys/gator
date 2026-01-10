import { Config, setUser, readConfig } from "./config.ts";
import { getUser } from "./lib/db/queries/users.ts";
import { Feed, User } from "./lib/db/schema.ts";
import { CommandHandler } from "./commands.ts";



export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;


export type MiddlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler; 


export function middlewareLoggedIn(handler: UserCommandHandler) {
    return async (cmdName, ...args) => {
        const currentUser = readConfig().currentUserName; 
        if (!currentUser) {
            throw new Error("User not logged in");
        }

        const userData = await getUser(currentUser);

        if (!userData) {
            throw new Error(`User ${currentUser} not found`);
        }
        await handler(cmdName, userData, ...args);
    }
}
