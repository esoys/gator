import { Config, setUser, readConfig } from "./config.ts";
import { getUser, createUser, resetDb, listUsers } from "./lib/db/queries/users.ts";
import { createFeed, listFeeds, getFeedByUrl } from "./lib/db/queries/feeds.ts";
import { fetchFeed } from "./lib/rss/rss_feed.ts";
import { createFeedFollow, getFeedFollowsForUser, deleteFeedFollow } from "./lib/db/queries/feed-follows.ts";
import { Feed, User } from "./lib/db/schema.ts";


export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandRegistry = Record<string, CommandHandler>;


export async function unfollowCommand(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <feed_url>`);
    }
    await deleteFeedFollowRecord(user.id, args[0]);
}


export async function deleteFeedFollowRecord(userId: string, url: string) {
    const feed = await getFeedByUrl(url);
    if (!feed) {
        throw new Error("feed not found");
    }

    await deleteFeedFollow(userId, feed.id);
    console.log(`Unfollowed feed: ${feed.name}`);
}

export async function addFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 2) {
        throw new Error(`usage: ${cmdName} <feed_name> <url>`);
    }
    const feedName = args[0];
    const url = args[1];

    const feed = await createFeed(feedName, url, user.id);

    if (!feed) {
        throw new Error("couldn't create feed");
    }
    printFeed(feed, user);
    const newFollow = await createFeedFollow(user.id, feed.id);
};


export async function followHandler(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error(`usage: ${cmdName} <url>`);
    } else {
        const url = args[0];
        const selectedFeed = await getFeedByUrl(url);
        if (!selectedFeed) {
            throw new Error("Feed not found");
        }

        const newFollow = await createFeedFollow(user.id, selectedFeed.id);
        console.log(`***Created Record***`);
        console.log(` - Feed: ${newFollow.feedName}`);
        console.log(` - User: ${newFollow.userName}`);
        console.log(`********************`);

    }
}


export async function followingCommand(cmdName: string, user: User, ...args: string[]) {
    if (args.length !== 0) {
        throw new Error(`no arguments expected`);
    } else {
        const feedFollows = await getFeedFollowsForUser(user.id);

        console.log(`current user: ${user.name}`)
        for (const row of feedFollows) {
            console.log(`- feed: ${row.feedName}`);
        };
    };

}



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


function printFeed(feed: Feed, user: User) {
    console.log(`- ID:   ${feed.id}`);
    console.log(`- Name: ${feed.name}`);
    console.log(`- URL:  ${feed.url}`);
    console.log(`- User: ${user.name}`);
}


export async function getFeeds(cmdName: string, ...args: string[]) {
    if (args.length !== 0) {
        throw new Error(`usage: only command without additional arguments`);
    }
    const feeds = await listFeeds();
    
    for (const feed of feeds) {
        console.log(`- Feed:       ${feed.name}`);
        console.log(`- URL:        ${feed.url}`);
        console.log(`- created by: ${feed.userName}`);
    };
}


export async function register(cmdName: string, ...args: string[]): Promise<void> {
    if (args.length !== 1) { throw new Error(`usage: ${cmdName} <name>`) };
    const name = args[0];

    const user = await getUser(name);
    if (user) {
        throw new Error("User already exists");
    } else {
        const created = await createUser(name); 
        setUser(created.name);
        console.log(`Created User: ${created.name}`);
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


export async function agg(cmdName: string, ...args: string[]) {
    const rssFeedData = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(rssFeedData, null, 2));
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


