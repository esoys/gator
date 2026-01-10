import { Config, setUser, readConfig } from "./config.ts";
import { CommandHandler, CommandRegistry, handlerLogin, followingCommand, followHandler, registerCommand, getUsers, register, runCommand, reset, agg, addFeed, getFeeds, unfollowCommand } from "./commands.ts";
import { middlewareLoggedIn } from "./login.ts";


async function main() {
    let registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", register);
    registerCommand(registry, "reset", reset);
    registerCommand(registry, "users", getUsers);
    registerCommand(registry, "agg", agg);
    registerCommand(registry, "feeds", getFeeds);
    registerCommand(registry, "addfeed", middlewareLoggedIn(addFeed));
    registerCommand(registry, "follow", middlewareLoggedIn(followHandler));
    registerCommand(registry, "following", middlewareLoggedIn(followingCommand));
    registerCommand(registry, "unfollow", middlewareLoggedIn(unfollowCommand));
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error("not enough arguments");
        process.exit(1);
    };

    const [cmdName, ...cmdArgs] = args;

    try {
        await runCommand(registry, cmdName, ...cmdArgs);
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error("Unknown Error");
        };
        process.exit(1);
    };
    process.exit(0);
};

main();
