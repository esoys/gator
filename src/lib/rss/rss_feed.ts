export type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[]:
    };
};


export type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
};


export async function fetchFeed(feedUrl: string) {
    const response = await fetch(feedUrl, {
        headers: {
            "User-Agent": "gator",
        },
    }).text();
}
