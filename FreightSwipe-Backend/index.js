/**
 * Local / container entrypoint.
 *
 * The Express app itself lives in app.js so that it can be shared between this
 * long-running server (docker-compose, `npm run dev`) and the Vercel serverless
 * function at /api. Keep route definitions in app.js, not here.
 */
const app = require('./app');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
