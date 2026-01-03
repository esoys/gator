import { Config, setUser, readConfig } from "./config.ts";
import { CommandHandler, CommandRegistry, handlerLogin, registerCommand, runCommand } from "./commands.ts";


function main() {
    let registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error("not enough arguments");
        process.exit(1);
    };

    const [cmdName, ...cmdArgs] = args;

    try {
        runCommand(registry, cmdName, ...cmdArgs);
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        } else {
            console.error("Unknown Error");
        };
        process.exit(1);
    };
};

main();
