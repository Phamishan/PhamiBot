const getBundles = async () => {
    try {
        const data = await fetch(
            `https://api.henrikdev.xyz/valorant/v2/store-featured`,
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

module.exports = getBundles;
