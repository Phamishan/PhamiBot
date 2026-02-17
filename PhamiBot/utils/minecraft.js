const fs = require("node:fs");
const path = require("node:path");
const { request } = require("undici");
const Jimp = require("jimp");

const CACHE_PATH = path.join(__dirname, "..", "data", "uuidCache.json");

function loadCache() {
    try {
        const raw = fs.readFileSync(CACHE_PATH, "utf8");
        return JSON.parse(raw || "{}");
    } catch (e) {
        return {};
    }
}

function saveCache(c) {
    try {
        fs.writeFileSync(CACHE_PATH, JSON.stringify(c, null, 2), "utf8");
    } catch (e) {
        // Create the slash command.
    }
}

async function getUuidForName(username) {
    const cache = loadCache();
    const key = username.toLowerCase();
    if (cache[key]) return cache[key];

    const api = `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(
        username,
    )}`;
    try {
        const res = await request(api, {
            method: "GET",
            headers: {
                "User-Agent": "PhamiBot/1.0",
                Accept: "application/json",
            },
        });
        const text = await res.body.text();
        if (!text) return null;
        const json = JSON.parse(text);
        if (json && json.id) {
            cache[key] = json.id;
            saveCache(cache);
            return json.id;
        }
    } catch (err) {
        console.error("Error fetching UUID for name:", err);
    }
    return null;
}

function getCrafatarUrlFromUuid(uuid, size = 64) {
    return `https://crafatar.lundhahn.dk/avatars/${uuid}?size=${size}&overlay=true`;
}

async function composeAvatarsGrid(uuids, size = 64, cols = 3) {
    const avatars = await Promise.all(
        uuids.map(async (u) => {
            const url = getCrafatarUrlFromUuid(u, size);
            try {
                const img = await Jimp.read(url);
                return img.resize(size, size);
            } catch (e) {
                return new Jimp(size, size, 0x000000ff);
            }
        }),
    );

    const rows = Math.ceil(avatars.length / cols);
    const out = new Jimp(cols * size, rows * size, 0x00000000);
    avatars.forEach((img, i) => {
        const x = (i % cols) * size;
        const y = Math.floor(i / cols) * size;
        out.composite(img, x, y);
    });
    return out;
}

module.exports = { getUuidForName, getCrafatarUrlFromUuid, composeAvatarsGrid };
