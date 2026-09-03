const getRankHistory = async (name, tag) => {
    try {
        const data = await fetch(
            `https://api.henrikdev.xyz/valorant/v1/mmr-history/eu/${name}/${tag}`,
            {
                method: "GET",
                headers: {
                    ACCEPT: "application/vnd.api+json",
                    Authorization: process.env.VL_API,
                },
            }
        );

        return await data.json();
    } catch (error) {
        return error.response;
    }
};

module.exports = getRankHistory;
