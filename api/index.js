/**
 * Vercel serverless entrypoint for the FreightSwipe API.
 *
 * Every request to /api/* is rewritten here by vercel.json. Vercel keeps the
 * "/api" prefix on req.url, but the Express app declares its routes without it
 * (/auth/login, /loads, ...), so we strip the prefix before handing the request
 * over. Serving the API from the same origin as the React app is what lets the
 * httpOnly auth cookie work without SameSite=None.
 */
const app = require('../FreightSwipe-Backend/app');

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api(?=\/|$)/, '') || '/';
  return app(req, res);
};
