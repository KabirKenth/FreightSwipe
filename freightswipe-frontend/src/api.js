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

/**
 * Turns whatever an API failure produced into a string safe to render.
 *
 * A crashed serverless function does not answer with the shape the app's own
 * error paths use: Vercel replies `{ error: { code, message } }`, and a
 * platform error page replies with raw HTML. Passing either straight into
 * state and rendering it throws React error #31 ("objects are not valid as a
 * React child"), which unmounts the whole tree and leaves a blank page — a far
 * worse failure than the request that caused it.
 *
 * So: only ever return a string, and prefer the app's own message when there
 * is one.
 */
export const errorMessage = (err, fallback) => {
  const data = err && err.response && err.response.data;

  const candidates = [
    data && data.error,
    data && data.message,
    typeof data === 'string' ? data : null,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const text = candidate.trim();
      // Skip an HTML error page; it is not a message anyone wants to read.
      if (text && text.length <= 200 && !text.startsWith('<')) return text;
    } else if (candidate && typeof candidate.message === 'string' && candidate.message.trim()) {
      return candidate.message.trim();
    }
  }

  return fallback;
};
