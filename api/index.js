const serverless = require("serverless-http");
const app = require("../index");

// Exponer solo el handler que Vercel espera
module.exports.handler = serverless(app);
