const getTrackedMatches = async (trackerId) => {
    if (!trackerId || !process.env.TRACKER_URL) {
        return { Error: "Player isn't linked to PhamiTracker" };
    }

    try {
        const response = await fetch(
            `${process.env.TRACKER_URL}/v1/players/${trackerId}/widget`,
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

module.exports = { getTrackedMatches };
