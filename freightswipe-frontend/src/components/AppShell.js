import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * The Aurora top bar and nav footer, wrapped around every interior page.
 *
 * Section links are derived from the current path rather than passed in by each
 * page, so adding a route to App.js is the only place a link has to be
 * registered. `variant="hero"` drops the bar onto a transparent, Paper White
 * treatment for the landing page, where it sits over the hero field.
 */

const SHIPPER_LINKS = [
  { to: '/shipper/dashboard', label: 'Dashboard' },
  { to: '/shipper/your-loads', label: 'Your loads' },
  { to: '/shipper/pending-matches', label: 'Pending' },
  { to: '/shipper/matched-loads', label: 'Matched' },
  { to: '/shipper/in-transit-loads', label: 'In transit' },
  { to: '/shipper/completed-loads', label: 'Completed' },
];

const TRUCKER_LINKS = [
  { to: '/trucker/dashboard', label: 'Dashboard' },
  { to: '/trucker/available-loads', label: 'Available' },
  { to: '/trucker/matched-loads', label: 'Matched' },
  { to: '/trucker/in-transit-loads', label: 'In transit' },
  { to: '/trucker/accepted-loads', label: 'Accepted' },
  { to: '/trucker/completed-loads', label: 'Completed' },
];

const linksFor = (pathname) => {
  if (pathname.startsWith('/shipper')) return SHIPPER_LINKS;
  if (pathname.startsWith('/trucker')) return TRUCKER_LINKS;
  return [];
};

/** The one place the Aurora Spectrum gradient is spent on this page. */
export const Wordmark = ({ className = '' }) => (
  <Link to="/" className={`au-nav__logo ${className}`.trim()}>
    <span className="au-spectrum">Freight</span>Swipe
  </Link>
);

export const TopNav = ({ variant = 'default' }) => {
  const { pathname } = useLocation();
  const links = linksFor(pathname);
  const overHero = variant === 'hero';
  // Over the hero the bar is transparent with Paper White type. Once the hero
  // has scrolled away that type would sit invisible on the canvas, so the bar
  // "lands" back onto Paper White.
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    if (!overHero) return undefined;

    const onScroll = () => setLanded(window.scrollY > window.innerHeight - 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overHero]);

  return (
    <header
      className={`au-nav${overHero ? ' au-nav--over-hero' : ''}${
        overHero && landed ? ' au-nav--landed' : ''
      }`}
    >
      <nav className="au-nav__inner" aria-label="Primary">
        <Wordmark />

        {links.length > 0 && (
          <ul className="au-nav__links">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`au-nav__link${pathname === link.to ? ' au-nav__link--active' : ''}`}
                  aria-current={pathname === link.to ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="au-nav__spacer" />

        {links.length === 0 && (
          <>
            <Link to="/login" className="au-nav__link">Log in</Link>
            <Link to="/signup" className="au-btn au-btn--primary au-btn--sm">
              Create an account <span aria-hidden="true">&rarr;</span>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export const SiteFooter = () => (
  <footer className="au-footer">
    <div className="au-footer__inner">
      <div className="au-footer__col">
        <h2 className="au-footer__heading">Shippers</h2>
        <ul className="au-footer__list">
          <li><Link className="au-footer__link" to="/shipper/dashboard">Post a load</Link></li>
          <li><Link className="au-footer__link" to="/shipper/your-loads">Your loads</Link></li>
          <li><Link className="au-footer__link" to="/shipper/pending-matches">Pending matches</Link></li>
        </ul>
      </div>

      <div className="au-footer__col">
        <h2 className="au-footer__heading">Truckers</h2>
        <ul className="au-footer__list">
          <li><Link className="au-footer__link" to="/trucker/available-loads">Available loads</Link></li>
          <li><Link className="au-footer__link" to="/trucker/matched-loads">Matched loads</Link></li>
          <li><Link className="au-footer__link" to="/trucker/completed-loads">Completed</Link></li>
        </ul>
      </div>

      <div className="au-footer__col">
        <h2 className="au-footer__heading">Account</h2>
        <ul className="au-footer__list">
          <li><Link className="au-footer__link" to="/login">Log in</Link></li>
          <li><Link className="au-footer__link" to="/signup">Sign up</Link></li>
        </ul>
      </div>

      <div className="au-footer__brand">
        <span className="au-nav__logo">
          <span className="au-spectrum">Freight</span>Swipe
        </span>
        <p className="au-footer__legal">
          &copy; {new Date().getFullYear()} FreightSwipe. Swipe-to-match freight booking.
        </p>
      </div>
    </div>
  </footer>
);

/**
 * Standard interior page frame: nav, a titled header band, content, footer.
 */
const AppShell = ({ title, eyebrow, standfirst, aside, children, variant = 'default' }) => (
  <div className="au-page">
    <TopNav variant={variant} />

    <main className="au-main">
      {title && (
        <div className="au-page-head">
          <div className="au-container">
            {eyebrow && <span className="au-eyebrow">{eyebrow}</span>}
            <h1 className="au-page-head__title">{title}</h1>
            {standfirst && <p className="au-page-head__standfirst">{standfirst}</p>}
            {aside && <div className="au-page-head__aside">{aside}</div>}
          </div>
        </div>
      )}

      <div className="au-container">{children}</div>
    </main>

    <SiteFooter />
  </div>
);

export default AppShell;
