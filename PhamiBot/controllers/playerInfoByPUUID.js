const getPlayerInfoByPUUID = async (puuid) => {
    try {
        const data = await fetch(
            `https://api.henrikdev.xyz/valorant/v1/by-puuid/account/${puuid}`,
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

module.exports = getPlayerInfoByPUUID;
