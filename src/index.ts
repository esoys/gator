import { Config, setUser, readConfig } from "./config.ts";
import { CommandHandler, CommandRegistry, handlerLogin, registerCommand, getUsers, register, runCommand, reset, agg, addFeed } from "./commands.ts";


async function main() {
    let registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", register);
    registerCommand(registry, "reset", reset);
    registerCommand(registry, "users", getUsers);
    registerCommand(registry, "agg", agg);
    registerCommand(registry, "addfeed", addFeed);
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
