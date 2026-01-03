import { Config, setUser, readConfig } from "./config.ts";

function main() {
    setUser("Erik");
    const currentConfig = readConfig();
    console.log(currentConfig);
}

main();
