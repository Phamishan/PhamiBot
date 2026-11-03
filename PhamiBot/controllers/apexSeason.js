const BASE_URL = "https://apexseasons.online";

const fetchHtml = async (url) => {
    const response = await fetch(url, {
        headers: { "User-Agent": "PhamiBot (Discord bot)" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
    return response.text();
};

const getJsonLd = (html) =>
    [
        ...html.matchAll(
            /<script type="application\/ld\+json">([^<]*)<\/script>/g,
        ),
    ]
        .map((match) => {
            try {
                return JSON.parse(match[1]);
            } catch {
                return null;
            }
        })
        .filter(Boolean);

const decodeHtml = (text) =>
    text
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");

// The homepage countdown flags end dates EA hasn't confirmed yet as estimated.
const isEstimated = (html) =>
    [...html.matchAll(/props="([^"]*)"/g)].some((match) => {
        const props = decodeHtml(match[1]);
        return (
            props.includes('"targetDate"') &&
            props.includes('"estimated":[0,true]')
        );
    });

const getApexSeason = async () => {
    try {
        const homeHtml = await fetchHtml(BASE_URL);

        // The season list is ordered newest first.
        const seasonList = getJsonLd(homeHtml).find(
            (block) => block["@type"] === "ItemList",
        );
        const seasonUrl = seasonList?.itemListElement?.[0]?.url;
        if (!seasonUrl) throw new Error("Season list not found");

        const seasonHtml = await fetchHtml(seasonUrl);
        const event = getJsonLd(seasonHtml).find(
            (block) => block["@type"] === "Event",
        );
        if (!event?.startDate || !event?.endDate) {
            throw new Error("Season dates not found");
        }

        // e.g. "Apex Legends Season 30 · Marked"
        const [season, name] = event.name
            .replace(/^Apex Legends\s+/, "")
            .split(" · ");

        return {
            season,
            name: name ?? season,
            startDate: event.startDate,
            endDate: event.endDate,
            estimated: isEstimated(homeHtml),
            url: seasonUrl,
        };
    } catch (error) {
        return { Error: error.message };
    }
};

module.exports = { getApexSeason };
