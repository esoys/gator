import fs from "fs";
import os from "os";
import path from "path";


export type Config = {
    dbUrl: string;
    currentUserName: string;
};


export function setUser(username: string): void {
    let config = readConfig();
    config.currentUserName = username;
    writeConfig(config);
};


function getConfigFilePath(): string {
    return path.join(os.homedir(), ".gatorconfig.json");
};


function writeConfig(userConfig: Config): void {
    fs.writeFileSync(getConfigFilePath(), JSON.stringify({
        db_url: userConfig.dbUrl,
        current_user_name: userConfig.currentUserName,
    }));
}; 


export function readConfig(): Config {
    return validateConfig(JSON.parse(fs.readFileSync(getConfigFilePath(), "utf-8")));
};


function validateConfig(json: any): Config {
    if ("db_url" in json && typeof json["db_url"] === "string") {
        return {
            dbUrl: json["db_url"],
            currentUserName: "current_user_name" in json ? json["current_user_name"] : "",
        };
    } else {
        throw new Error("Config is invalid");
    };
};
