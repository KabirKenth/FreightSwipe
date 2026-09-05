# Testing strategy

## Where things stand

`@testing-library/react`, `@testing-library/jest-dom` and `@testing-library/user-event`
are installed and `react-scripts test` is wired up, but **there are no test files in
the repository** — not one `*.test.js`. Everything that has been verified so far was
verified by hand against a deployment. That is the single largest gap, and it is what
this document is written to close.

The backend has no tests either. It does have a `/health` route that proves the
database is reachable, which is the one automated check that exists today.

## The shape of the pyramid here

FreightSwipe is a small app whose risk is concentrated in two places: the **status
machine** a load moves through, and the **role split** that decides which side of a
match you see. Neither is expressible as a unit test of a pure function — both live in
the interaction between the Express handlers and Prisma. So the pyramid for this repo
is deliberately middle-heavy:

```
        /   E2E   \        3-6 flows. Slow, but the only thing that proves
       /            \      the status machine works end to end.
      /  Integration  \    The bulk. Express + a test database, per route,
     /                  \  per role. This is where the real risk lives.
    /    Unit tests      \ Few. Pure helpers only.
```

Inverting this — chasing unit-test coverage on components — would produce a high
number and catch almost nothing, because almost nothing in this app is a pure
function of its props.

## What to cover, by layer

### Unit — few, fast, worth it anyway

Only genuinely pure logic. These are cheap and they guard real bugs that have already
happened once.

| Target | Why it earns a test |
|---|---|
| `errorMessage()` (`src/api.js`) | Exists *because* an unhandled shape white-screened the app. Cases: string error, `{error:{code,message}}`, HTML error page, network error with no `response`, `null` data. Every one must return a string. |
| `formatRoute` / `formatEndpoints` (`src/components/Record.js`) | Must not throw on a missing `origin`/`destination`, which the API can return mid-transition. |
| `formatWeight` / `formatMoney` | Grouping and the empty/`null` passthrough. |
| `toAddress()` (`src/components/PlaceAutocomplete.js`) | Handles both the new Places shape (`longText`) and the legacy one (`long_name`). A silent regression here degrades address entry with no error. |

**Target: 100% of these four.** They are the whole unit tier.

### Integration — the bulk of the effort

Express + Prisma against a throwaway Postgres (the `docker-compose.yml` stack, or a
schema-per-run). Supertest against `app.js`. This is where to spend the time.

| Area | Cases |
|---|---|
| Auth | Signup, login, bad credentials, cookie is `httpOnly`, `/auth/demo` for each role, `/auth/demo` with an unknown role → 400, protected route without a cookie → 401. |
| **Role scoping** | `GET /matches` as a trucker includes `shipper` and never another trucker's rows; as a shipper includes `trucker`. `GET /loads` returns only the caller's loads. `GET /loads/available` rejects a shipper with 403. This is the highest-value block in the table — a leak here is a data breach, not a bug. |
| **Status machine** | `PENDING → MATCHED` only via a match both sides accepted. `MATCHED → IN_TRANSIT` only once **both** `shipperInTransitConfirmed` and `truckerInTransitConfirmed` are set — assert that one side alone does *not* advance it. `IN_TRANSIT → COMPLETED`. Every illegal transition rejected. |
| Ownership | A shipper cannot delete, cancel or advance another shipper's load. A trucker cannot review a load they did not carry. Expect 403, not 404-by-accident. |
| Loads | Create with a valid body; reject non-positive weight and budget, a past deadline, and identical origin/destination *server-side* — the client checks these today, and a client check is not a control. |
| Reviews | One review per user per load; rating outside 1–5 rejected; review only allowed on a `COMPLETED` load. |
| Cancellation | The $5 fee is applied exactly once, and the load lands in `CANCELLED`. |

**Target: every route handler exercised, both roles where the handler branches on
role, and every rejection path asserted — not just the happy path.**

### Component — thin, behaviour only

React Testing Library, rendering against mocked axios. Assert behaviour, never
markup or class names, or the tests will break on the next restyle.

| Component | Cases |
|---|---|
| `ConfirmAction` | Trigger shows the prompt; "Keep it" closes it **without** calling `onConfirm`; the confirm button calls it exactly once. The escape path is the one that matters. |
| `CreateLoadForm` | Each cross-field rule renders its notice and issues **no** request. |
| `Record` | Renders with `origin`/`destination` missing without throwing. |
| `ErrorBoundary` | A child that throws yields the fallback, not a blank tree. |
| `Deck` | Renders a load (trucker shape) and a match (shipper shape, `item.load`); the accept/pass handlers fire with the right id. |
| `AppShell` | Nav links reflect the path prefix; the hero nav "lands" past the fold. |

**Target: the six above. Do not chase a percentage on presentational components.**

### End-to-end — few, and only the flows that cross both sides

Playwright against a seeded environment. Each of these spans two roles and the
status machine, which is exactly what nothing else covers.

1. Shipper posts a load → trucker sees it on the board → swipes right → shipper sees
   the pending match → confirms → both confirm in transit → shipper marks delivered →
   both review → each review shows on the other's profile.
2. Trucker swipes left → the load leaves their board and appears under "Passed on",
   and is not offered again.
3. Shipper cancels a matched load → the trucker loses the booking, the fee is charged.

**Target: flow 1 always. It is the product.**

### What to skip

Presentational components with no logic, the token layer, `reportWebVitals`, and
anything that only asserts a class name is present. Snapshot tests of markup are
actively harmful here — the app was just fully restyled, and every snapshot would
have needed regenerating without catching a single real defect.

## The smoke suite

`e2e/smoke.mjs` is committed and runnable today:

```bash
npm i -D playwright && npx playwright install chromium
BASE=https://<deployment> node e2e/smoke.mjs
```

It signs in as each seeded demo account, walks all 16 routes, and asserts a mounted
tree, a heading, no error boundary, no uncaught or console error, and no failure
notice — plus the two Aurora invariants that regress silently: no box-shadows and no
transparent buttons. It performs **no writes**, so it is safe against production, and
it exits non-zero, so it can gate a merge.

What it will not catch: anything requiring a write, wrong-but-rendering data, layout
regressions, or accessibility. Those need the tiers above.

## Suggested order

1. The four unit helpers — an afternoon, and they cover a bug that already shipped.
2. Role scoping and the status machine at the integration tier — the real risk.
3. `ConfirmAction` and `CreateLoadForm` component tests — they guard user-facing
   guarantees that are easy to break in a refactor.
4. E2E flow 1.
5. Wire `smoke.mjs` into CI against the preview URL for every pull request.
