# FreightSwipe

A freight marketplace where shippers post loads and truckers swipe through the ones
that fit. Both sides confirm pickup, track the load in transit, and review each
other on delivery.

**Live demo:** _(URL added after first deploy)_ — use the **Explore as a Shipper** /
**Explore as a Trucker** buttons on the landing page. No registration needed.

## Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 19 (Create React App), React Router, Bootstrap |
| API       | Express, Prisma, JWT in an httpOnly cookie        |
| Database  | PostgreSQL                                        |
| Hosting   | Vercel — static bundle plus one serverless function |

## Layout

```
api/index.js              Vercel serverless entrypoint; strips /api and delegates to Express
FreightSwipe-Backend/
  app.js                  The Express app: routes, middleware, auth. Exports the app.
  index.js                Local/container entrypoint; just app.listen()
  prisma/schema.prisma    Data model
  prisma/seed.js          Demo dataset
freightswipe-frontend/
  src/api.js              Single source of truth for the API base URL
vercel.json               Build settings and routing
```

`app.js` is shared: the long-running server (`index.js`, used by docker-compose) and
the serverless function (`api/index.js`) both mount the same Express app, so there is
one set of routes to maintain.

## Why one domain

The API is served from `/api` on the same origin as the frontend rather than from a
separate host. Auth is a JWT in an httpOnly cookie, and browsers do not send
cookies on cross-site XHR unless they are marked `SameSite=None; Secure`. Sharing an
origin keeps the cookie first-party, which means no `SameSite=None`, no CORS
preflights, and no cold-start delay from a second service.

## Running locally

Requires Docker and Docker Compose.

```bash
cp .env.example .env          # then fill in POSTGRES_* and JWT_SECRET
docker-compose up -d --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001
- Health check: http://localhost:3001/health

Load the demo dataset:

```bash
npm install
DATABASE_URL=... DIRECT_URL=... npm run db:reset-demo
```

Stop and wipe:

```bash
docker-compose down -v
```

## Deploying

The Vercel project builds from the repository root. Set these environment variables
in **Project Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Pooled Postgres connection (Supabase transaction pooler, port 6543, with `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | Direct Postgres connection (port 5432) — used for migrations only |
| `JWT_SECRET` | `openssl rand -base64 32` |
| `NODE_ENV` | `production` |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Browser key, restricted by HTTP referrer to the deployed domain |

Migrations and seeding run from a machine with `DIRECT_URL` set, not from the build:

```bash
npm run db:migrate     # prisma migrate deploy
npm run db:seed        # demo data
npm run db:reset-demo  # both, to reset the live demo
```

## Demo accounts

Password for all three: `demo1234`

| Role    | Email                           |
|---------|---------------------------------|
| Shipper | `demo.shipper@freightswipe.app` |
| Trucker | `demo.trucker@freightswipe.app` |
| Admin   | `admin@freightswipe.app`        |

Re-running the seed recreates them, so the demo can be reset at any time.

## API

| Method | Route | Access | Purpose |
|--------|-------|--------|---------|
| POST | `/auth/signup` | public | Register as SHIPPER or TRUCKER |
| POST | `/auth/login` | public | Sign in |
| POST | `/auth/demo` | public | Sign in as a seeded demo account |
| POST | `/auth/logout` | public | Clear the auth cookie |
| GET | `/health` | public | Liveness plus a database ping |
| GET | `/loads` | private | Loads belonging to the caller |
| POST | `/loads` | shipper | Post a load |
| GET | `/loads/available` | trucker | Swipe deck: open loads not yet acted on |
| DELETE | `/loads/:id` | shipper | Remove a load |
| PUT | `/loads/:id/status` | private | Advance to IN_TRANSIT or COMPLETED |
| POST | `/loads/:id/cancel` | shipper | Cancel, charging a fee |
| GET | `/matches` | private | Matches for the caller |
| POST | `/matches` | private | Swipe on a load, or respond to an application |
| POST | `/reviews` | private | Review a counterparty on a completed load |
| GET | `/reviews/:userId` | private | Reviews and average rating for a user |

## Security notes

- Passwords are bcrypt hashed; the hash is never returned to the client.
- Auth is an httpOnly cookie, so the token is not reachable from JavaScript.
- Rate limiting on the auth routes, with `trust proxy` set for the Vercel hop.
- Input validated with Joi; `helmet` sets security headers.
- Never commit `.env`. Each directory has a `.env.example` listing the keys.
