const getCS2Stats = async (steamId) => {
    try {
        const data = await fetch(
            `https://api-public.cs-prod.leetify.com/v3/profile?steam64_id=${steamId}`,
            {
                method: "GET",
            },
        );
        const result = await data.json();
        return {
            status: data.status,
            data: result,
        };
    } catch (error) {
        return {
            status: 500,
            data: error,
        };
    }
};

module.exports = { getCS2Stats };
