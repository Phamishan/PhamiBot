const getBundleImage = async () => {
    try {
        const data = await fetch(`https://valorant-api.com/v1/bundles`, {
            method: "GET",
            headers: {
                ACCEPT: "application/vnd.api+json",
            },
        });
        return await data.json();
    } catch (error) {
        return error.response;
    }
};

module.exports = getBundleImage;
