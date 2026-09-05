/**
 * Read-only smoke suite.
 *
 * Signs in as each seeded demo account and walks every route the app exposes,
 * asserting that the page actually RENDERED rather than merely responded: a
 * mounted tree, a heading, no error boundary, no uncaught or console error,
 * and no failure notice. It also checks the two Aurora invariants that are
 * easy to regress silently -- no box-shadows, no transparent "ghost" buttons.
 *
 * Performs no writes. Safe to run against any deployment, including production.
 *
 *   npm i -D playwright && npx playwright install chromium
 *   BASE=https://your-deployment.vercel.app node e2e/smoke.mjs
 *
 * Exits non-zero on the first failing route, so it can gate a merge.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3000';

const ROUTES = {
  PUBLIC: ['/', '/login', '/signup'],
  SHIPPER: [
    '/shipper/dashboard', '/shipper/your-loads', '/shipper/pending-matches',
    '/shipper/matched-loads', '/shipper/in-transit-loads', '/shipper/completed-loads',
  ],
  TRUCKER: [
    '/trucker/dashboard', '/trucker/available-loads', '/trucker/matched-loads',
    '/trucker/in-transit-loads', '/trucker/accepted-loads', '/trucker/declined-loads',
    '/trucker/completed-loads',
  ],
};

/** A notice is only a failure when it reports one; the app also uses them for status. */
const isFailureNotice = (text) => !!text && /^(failed|could not|error|unable)/i.test(text);

const probe = () => {
  const heading = document.querySelector('h1');
  const notice = document.querySelector('.au-notice');
  return {
    mounted: document.getElementById('root').children.length > 0,
    heading: heading ? heading.textContent.trim() : null,
    // The ErrorBoundary's own copy -- if this shows, a render threw.
    boundary: !!(heading && heading.textContent.includes('stopped short')),
    notice: notice ? notice.textContent.trim().slice(0, 160) : null,
    records: document.querySelectorAll('.au-record').length,
    deck: document.querySelectorAll('.swipe-card').length,
    empty: !!document.querySelector('.au-empty'),
    footer: !!document.querySelector('.au-footer'),
    shadows: [...document.querySelectorAll('.au-btn,.au-card,.au-record,.au-nav,.swipe-card')]
      .filter((el) => getComputedStyle(el).boxShadow !== 'none').length,
    ghosts: [...document.querySelectorAll('.au-btn')]
      .filter((el) => getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)').length,
  };
};

const results = [];

const walk = async (role, routes, ctx) => {
  for (const route of routes) {
    const page = await ctx.newPage();
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const p = await page.evaluate(probe);

    const failures = [];
    if (!p.mounted) failures.push('tree not mounted');
    if (!p.heading) failures.push('no heading rendered');
    if (p.boundary) failures.push('error boundary caught a render throw');
    if (isFailureNotice(p.notice)) failures.push(`failure notice: ${p.notice}`);
    if (p.shadows) failures.push(`${p.shadows} element(s) carry a box-shadow`);
    if (p.ghosts) failures.push(`${p.ghosts} transparent (ghost) button(s)`);
    pageErrors.forEach((e) => failures.push(`pageerror: ${e}`));
    consoleErrors.forEach((e) => failures.push(`console: ${e.slice(0, 160)}`));

    results.push({ role, route, failures, ...p });
    await page.close();
  }
};

const browser = await chromium.launch();
try {
  const anon = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await walk('PUBLIC', ROUTES.PUBLIC, anon);
  await anon.close();

  // One context per role so the httpOnly auth cookie stays scoped.
  for (const role of ['SHIPPER', 'TRUCKER']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    const res = await ctx.request.post(`${BASE}/api/auth/demo`, { data: { role } });
    if (!res.ok()) {
      results.push({ role, route: '(demo login)', failures: [`demo login returned ${res.status()}`] });
      await ctx.close();
      continue;
    }
    await walk(role, ROUTES[role], ctx);
    await ctx.close();
  }
} finally {
  await browser.close();
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('ROLE', 9) + pad('ROUTE', 30) + pad('RESULT', 8) + pad('RECORDS', 9) + 'HEADING');
for (const r of results) {
  console.log(
    pad(r.role, 9) + pad(r.route, 30) + pad(r.failures.length ? 'FAIL' : 'pass', 8)
    + pad(r.records ?? 0, 9) + (r.heading || '—')
  );
}

const failed = results.filter((r) => r.failures.length);
console.log(`\n${results.length - failed.length}/${results.length} routes passed`);
for (const f of failed) {
  console.log(`\nFAIL  ${f.role} ${f.route}`);
  f.failures.forEach((x) => console.log(`  - ${x}`));
}

process.exit(failed.length ? 1 : 0);
