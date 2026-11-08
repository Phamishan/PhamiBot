const getValorantMatch = async (matchId) => {
    if (!process.env.TRACKER_URL) {
        return { Error: "TRACKER_URL isn't set" };
    }

    try {
        const response = await fetch(
            `${process.env.TRACKER_URL}/v1/valorant/matches/${matchId}?region=eu`,
            { headers: { "X-App-Key": process.env.TRACKER_APP_KEY ?? "" } },
        );
        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
            return { Error: body.error ?? response.statusText };
        }
        return body;
    } catch (error) {
        return { Error: error.message };
    }
};

module.exports = { getValorantMatch };
