const axios = require("axios");

const getPlayerRank = async (name, tag, req, res) => {
  try {
    const { data } = await axios.get(
      `https://api.henrikdev.xyz/valorant/v1/mmr/eu/'${name}'/'${tag}'`,
      {
        headers: {
          ACCEPT: "application/vnd.api+json",
          Authorization: process.env.VL_API,
        },
      }
    );

    // res.status(200).json(data);
    return data;
  } catch (error) {
    // res.status(500).json({ message: 'Something went wrong.' });
    console.log(error.message);
  }
};

module.exports = getPlayerRank;
