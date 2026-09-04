/**
 * Single source of truth for where the API lives.
 *
 * Production (Vercel): "/api" — the React app and the Express API are served from
 * the same origin, which is what lets the httpOnly auth cookie be sent on every
 * request without needing SameSite=None.
 *
 * Local docker-compose: http://localhost:3001.
 */
export const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default API_BASE;
