const getMapRotation = async () => {
    try {
        const data = await fetch(
            `https://api.mozambiquehe.re/maprotation?auth=${process.env.AL_API}&version=2`,
        );
        return await data.json();
    } catch (error) {
        return { status: 500, error: error.message };
    }
};

module.exports = { getMapRotation };
