import { db } from "..";
import { feeds, users, feedFollows } from "../schema.ts";
import { eq, and } from "drizzle-orm";
import { uuid } from "drizzle-orm/pg-core";
import { Feed, User } from "../schema.ts";

export async function createFeedFollow(userId: string, feedId: string) {
    const existing = await db.select().from(feedFollows).where(
        and(
            eq(feedFollows.userId, userId),
            eq(feedFollows.feedId, feedId),
        ),
    );

    let baseRow
    if (existing.length > 0) {
        baseRow = existing[0];
    } else {
        const [newFeedFollow] = await db.insert(feedFollows).values({
            userId: userId,
            feedId: feedId,
        }).returning();
        baseRow = newFeedFollow;
    }
    
    const [result] = await db.select({
        id: feedFollows.id,
        createdAt: feedFollows.createdAt,
        updatedAt: feedFollows.updatedAt,
        feedName: feeds.name,
        userName: users.name,
    }).from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.id, baseRow.id));

    return result;
} 


export async function getFeedFollowsForUser(userId: string) {
    const result = await db.select({
        feedName: feeds.name,
        userName: users.name,
    }).from(feedFollows)
        .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
        .innerJoin(users, eq(feedFollows.userId, users.id))
        .where(eq(feedFollows.userId, userId));
    return result;
}


export async function deleteFeedFollow(userId: string, feedId: string) {
    await db.delete(feedFollows).where(
        and(
            eq(feedFollows.userId, userId),
            eq(feedFollows.feedId, feedId)
        )
    );
}
