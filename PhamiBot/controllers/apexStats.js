const getApexStats = async (input) => {
    try {
        const data = await fetch(
            `https://api.mozambiquehe.re/bridge?auth=${process.env.AL_API}&player=${input}&platform=PC`,
        );
        return await data.json();
    } catch (error) {
        return { status: 500, error: error.message };
    }
};

const getApexStatsUUID = async (input) => {
    try {
        const UUID = input.split("-")[0];
        const PLATFORM = input.split("-")[1];

        const data = await fetch(
            `https://api.mozambiquehe.re/bridge?auth=${process.env.AL_API}&uid=${UUID}&platform=${PLATFORM}`,
        );
        return await data.json();
    } catch (error) {
        return { status: 500, error: error.message };
    }
};

module.exports = { getApexStats, getApexStatsUUID };
