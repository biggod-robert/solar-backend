const serverless = require("serverless-http");
const app = require("../index"); // se usa el app que ya  se exporta en index.js
module.exports = app;
module.exports.handler = serverless(app);
