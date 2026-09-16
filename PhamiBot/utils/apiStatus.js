function getResponseStatus(response) {
    return response?.status ?? response?.errors?.[0]?.status;
}

module.exports = { getResponseStatus };
