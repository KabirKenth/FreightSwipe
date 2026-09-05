import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, dashboardFor } from '../auth';

/**
 * The Aurora top bar and nav footer, wrapped around every interior page.
 *
 * Both are session-aware. Nothing role-specific is shown to a visitor who is
 * not signed in -- a stranger has no use for "Pending matches", and a shipper
 * has no use for the trucker queues, which would only 403.
 *
 * `variant="hero"` drops the bar onto a transparent treatment for the landing
 * page, where it sits over the hero field.
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

const QUEUES = { SHIPPER: SHIPPER_LINKS, TRUCKER: TRUCKER_LINKS };

/**
 * Section links for the bar. Driven by the signed-in role rather than the URL,
 * so typing a shipper path while signed out does not produce a nav for an
 * account you are not in.
 */
const linksFor = (user, pathname) => {
  const links = (user && QUEUES[user.role]) || [];
  const prefix = user && user.role === 'SHIPPER' ? '/shipper' : '/trucker';
  return pathname.startsWith(prefix) ? links : [];
};

/** The one place the Aurora Spectrum gradient is spent on this page. */
export const Wordmark = ({ className = '' }) => (
  <Link to="/" className={`au-nav__logo ${className}`.trim()}>
    <span className="au-spectrum">Freight</span>Swipe
  </Link>
);

export const TopNav = ({ variant = 'default' }) => {
  const { pathname } = useLocation();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const links = linksFor(user, pathname);
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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

        {/* Until /auth/me answers we do not know which of these is true.
            Rendering the signed-out state meanwhile makes the bar flicker on
            every page load, so render neither. */}
        {!loading && (user ? (
          <>
            {links.length === 0 && (
              <Link to={dashboardFor(user.role)} className="au-nav__link">
                Dashboard
              </Link>
            )}
            <button type="button" className="au-nav__link au-nav__signout" onClick={handleSignOut}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="au-nav__link">Log in</Link>
            <Link to="/signup" className="au-btn au-btn--primary au-btn--sm">
              Create an account <span aria-hidden="true">&rarr;</span>
            </Link>
          </>
        ))}
      </nav>
    </header>
  );
};

export const SiteFooter = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queues = (user && QUEUES[user.role]) || [];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <footer className="au-footer">
      <div className="au-footer__inner">
        {/* Only the column for the role actually signed in. A stranger gets no
            queue links at all, and a shipper is never offered the trucker
            board, which would only answer 403. */}
        {!loading && queues.length > 0 && (
          <div className="au-footer__col">
            {/* "Your queues" matches the heading the dashboards already use,
                and avoids a column headed "Your loads" whose first link is
                also "Your loads". */}
            <h2 className="au-footer__heading">Your queues</h2>
            <ul className="au-footer__list">
              {queues.slice(1).map((q) => (
                <li key={q.to}>
                  <Link className="au-footer__link" to={q.to}>{q.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && (
          <div className="au-footer__col">
            <h2 className="au-footer__heading">Account</h2>
            <ul className="au-footer__list">
              {user ? (
                <>
                  <li>
                    <Link className="au-footer__link" to={dashboardFor(user.role)}>Dashboard</Link>
                  </li>
                  <li>
                    <button type="button" className="au-footer__link au-footer__signout" onClick={handleSignOut}>
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link className="au-footer__link" to="/login">Log in</Link></li>
                  <li><Link className="au-footer__link" to="/signup">Sign up</Link></li>
                </>
              )}
            </ul>
          </div>
        )}

        <div className="au-footer__brand">
          <span className="au-nav__logo">
            <span className="au-spectrum">Freight</span>Swipe
          </span>
          <p className="au-footer__legal">
            &copy; {new Date().getFullYear()} FreightSwipe. Swipe-to-match freight booking.
          </p>
          {!loading && user && (
            <p className="au-footer__legal">
              Signed in as {user.name} · {user.role.toLowerCase()}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

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
