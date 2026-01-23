const axios = require("axios");

const whitebooksClient = axios.create({
  baseURL: process.env.GST_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    client_id: process.env.GST_CLIENT_ID,
    client_secret: process.env.GST_CLIENT_SECRET,
  },
  timeout: 15000,
});

module.exports = whitebooksClient;
