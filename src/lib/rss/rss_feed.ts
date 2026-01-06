import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

const parser = new XMLParser();

export type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
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
    });

    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.text();

    const validated = XMLValidator.validate(result);

    if (validated !== true) {
        console.error(validated.msg);
    }   

    const parsedObj = parser.parse(result);

    const channel = parsedObj["rss"]["channel"];
    if (!channel) {
        throw new Error("Channel field of fetch response missing");
    } else if (!channel["title"] || !channel["link"] || !channel["description"]) {
        throw new Error("responst object not as expected");
    }

    const title = channel["title"];
    const link = channel["link"];
    const description = channel["description"];

    const items = [];

    if (channel["item"]) {
        if (!Array.isArray(channel["item"])) {
            channel["item"] = [channel["item"]];
        };
    } else {
        channel["item"] = [];
    };

    for (const item of channel["item"]) {
        const i_title = item["title"];
        const i_link = item["link"];
        const i_description = item["description"];
        const i_pubDate = item["pubDate"];

        if (!i_title || !i_link || !i_description || !i_pubDate) {
            continue;
        } else {
            items.push({
                title: i_title,
                link: i_link,
                description: i_description,
                pubDate: i_pubDate,
            });
        };
    };

    return {
        channel: {
            title: title,
            link: link,
            description: description,
            item: items,
        },
    };
}

