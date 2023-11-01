const axios = require("axios");

const getBundleImage = async () => {
    try {
        const { data } = await axios.get(
            `https://valorant-api.com/v1/bundles`,
            {
                headers: {
                    ACCEPT: "application/vnd.api+json",
                    Authorization: process.env.VL_API,
                },
            }
        );

        return data;
    } catch (error) {
        return error.response;
    }
};

module.exports = getBundleImage;
