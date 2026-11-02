// Shared fetch helper and error messages for the Apex Legends Status API.

const BASE_URL = "https://api.apexlegendsstatus.com";

const ERROR_MESSAGES = {
    400: "The Apex API is busy right now. Try again in a moment.",
    403: "The bot's Apex API key was rejected.",
    404: "Apex Legends profile not found.",
    405: "The Apex API couldn't reach EA's servers. Try again later.",
    410: "Unknown platform.",
    429: "Too many requests. Try again in a few seconds.",
    500: "The Apex API had an internal error. Try again later.",
};

// Returns the parsed body, or { Error, status } when the request fails.
const fetchApex = async (endpoint, params = {}) => {
    try {
        const query = new URLSearchParams({ auth: process.env.AL_API, ...params });
        const response = await fetch(`${BASE_URL}/${endpoint}?${query}`);
        const body = await response.json().catch(() => ({}));

        if (!response.ok || body.Error) {
            return {
                Error: body.Error ?? response.statusText,
                status: response.status,
            };
        }
        return body;
    } catch (error) {
        return { Error: error.message, status: 500 };
    }
};

const getApexErrorMessage = (status) =>
    ERROR_MESSAGES[status] ??
    "Something went wrong while contacting the Apex API.";

module.exports = { fetchApex, getApexErrorMessage };
