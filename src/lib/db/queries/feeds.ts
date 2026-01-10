import { db } from "..";
import { feeds, users } from "../schema.ts";
import { eq } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db.insert(feeds).values({
        name: name,
        url: url,
        userId: userId
    }).returning();
    return result;
}

export async function getFeedByUrl(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));

    if (result) {
        return result;
    } else {
        throw new Error("feed not found");
    }
}

export async function listFeeds() {
    const result = await db.select({
        name: feeds.name,
        url: feeds.url,
        userId: feeds.userId, 
    }).from(feeds);
    if (result) {
        const feedList = [];
        for (const feed of result) {
            feedList.push({
                name: feed.name,
                url: feed.url,
                userName: await getUser(feed.userId),
            });
        };
        return feedList; 
    } else {
        return undefined;
    };
}

async function getUser(userId: uuid) {
    const [result] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
    if (result) {
        return result.name;
    } else {
        return undefined;
    };
}
