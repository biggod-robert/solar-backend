const serverless = require("serverless-http");
const app = require("../index");

const handler = serverless(app);

// ✅ Exportar directamente la función que Vercel espera
module.exports = (req, res) => {
  return handler(req, res);
};