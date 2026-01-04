import { db } from "..";
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(name: string) {
    const [result] = await db.insert(users).values({ name: name }).returning();
    return result;
}


export async function getUser(name: string) {
    const [result] = await db.select().from(users).where(eq(users.name, name));
    if (result) {
        return result; 
    } else {
        return undefined;
    };
}


export async function listUsers() {
    const result = await db.select({
        name: users.name,
    }).from(users);

    if (result) {
        return result;
    } else {
        return undefined;
    };
}


export async function resetDb() {
    await db.delete(users);
}
