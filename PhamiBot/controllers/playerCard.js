const getPlayerCard = async (playercardUuid) => {
    try {
        const data = await fetch(
            `https://valorant-api.com/v1/playercards/${playercardUuid}`,
            {
                method: "GET",
                headers: {
                    ACCEPT: "application/vnd.api+json",
                },
            }
        );
        return await data.json();
    } catch (error) {
        return error.response;
    }
};

module.exports = getPlayerCard;
