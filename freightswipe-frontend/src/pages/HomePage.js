import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';
import { TopNav, SiteFooter } from '../components/AppShell';
import Reveal from '../components/Reveal';

/**
 * Landing page, built to the Aurora hero pattern: a full-viewport dashcam
 * plate under a Horizon Navy scrim, a 90px Paper White headline anchored to
 * the lower-left third, an Experience Card floating lower-right and a stats
 * bar along the bottom edge. Editorial reveal sections follow below the fold.
 *
 * Alongside the usual login/signup, this offers one-click demo access: the
 * /auth/demo endpoint signs the visitor in as a pre-seeded shipper or trucker
 * so the deployed app can be explored without registering.
 */

/* The single lane marking receding to the vanishing point. This is the
   structural stand-in for the documentary windshield still: drop a real one at
   public/hero-highway.jpg and the <img> below covers it. */
const LaneMarking = () => (
  <svg
    className="au-hero-section__lane"
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMax slice"
    aria-hidden="true"
    focusable="false"
  >
    <g stroke="currentColor" fill="none" strokeWidth="2">
      <path d="M720 470 L 120 900" />
      <path d="M720 470 L 1320 900" />
      <path d="M720 470 L 470 900" strokeOpacity="0.5" />
      <path d="M720 470 L 970 900" strokeOpacity="0.5" />
    </g>
    <g stroke="currentColor" strokeWidth="3" strokeLinecap="butt">
      <path d="M720 486 L 720 502" />
      <path d="M720 530 L 720 560" />
      <path d="M720 600 L 720 650" />
      <path d="M720 706 L 720 786" />
      <path d="M720 850 L 720 900" />
    </g>
    <line x1="0" y1="470" x2="1440" y2="470" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
  </svg>
);

const STATS = [
  { label: 'Post to match', value: 'Minutes, not calls' },
  { label: 'Booking', value: 'Swipe, both sides confirm' },
  { label: 'Tracking', value: 'Pickup through delivery' },
  { label: 'Trust', value: 'Two-way reviews on every load' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState('');

  const enterDemo = async (role) => {
    setError('');
    setLoadingRole(role);
    try {
      await axios.post(`${API_BASE}/auth/demo`, { role }, { withCredentials: true });
      navigate(role === 'SHIPPER' ? '/shipper/dashboard' : '/trucker/dashboard');
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Could not start the demo. Please try again.';
      setError(message);
      setLoadingRole(null);
    }
  };

  return (
    <div className="au-page">
      <TopNav variant="hero" />

      <main className="au-main">
        {/* ---------- Hero ---------- */}
        <section className="au-hero-section">
          <LaneMarking />
          <div className="au-hero-section__scrim" />

          <div className="au-hero-section__content au-on-navy">
            <div>
              <h1 className="au-hero au-hero-section__headline">
                Freight that books itself.
              </h1>
              <p className="au-hero-section__standfirst">
                Shippers post loads. Truckers swipe through the ones that fit. Both sides
                confirm pickup, track delivery, and review each other when it is done.
              </p>
              <div className="au-actions">
                <Link to="/signup" className="au-btn au-btn--primary">
                  Create an account <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link to="/login" className="au-btn au-btn--secondary">
                  Log in
                </Link>
              </div>
            </div>

            {/* Experience card */}
            <aside className="au-experience">
              {/* The card takes a full-bleed photo above the body. Until there
                  is real truck photography to put here, the slot is omitted
                  rather than reserved -- an empty Horizon Navy block on a
                  Horizon Navy hero is a void, not a placeholder.
                  <img className="au-experience__figure" src="/truck.jpg" alt="" /> */}
              <div className="au-experience__body">
                <div>
                  <span className="au-experience__label">Experiencing</span>
                  <p className="au-experience__title">Ride along with a demo account</p>
                </div>
                <a className="au-arrow-btn" href="#demo" aria-label="Jump to the demo accounts">
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </aside>
          </div>

          <div className="au-stats">
            <div className="au-stats__inner">
              {STATS.map((stat) => (
                <div className="au-stats__item" key={stat.label}>
                  <span className="au-stats__label">{stat.label}</span>
                  <span className="au-stats__value">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Editorial ---------- */}
        <section className="au-section">
          <div className="au-container">
            <div className="au-editorial">
              <div>
                <span className="au-eyebrow">How it works</span>
                <h2 className="au-heading-sm">
                  A load board that behaves<br />like a booking.
                </h2>
              </div>

              <div>
                <Reveal>
                  A shipper posts a lane with its weight, its budget and the day it has to be
                  there. Nothing goes out to a phone tree and nothing sits in an inbox waiting
                  for a callback.
                </Reveal>
                <Reveal>
                  Truckers see the loads that fit and answer with a swipe. Right is interest,
                  left is a pass, and neither one commits anybody to anything on its own.
                </Reveal>
                <Reveal>
                  A match only becomes a booking when both sides confirm it. From there the load
                  moves through pickup, transit and delivery in the same place it was posted,
                  and both parties review each other once it lands.
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <div className="au-container"><hr className="au-divider" /></div>

        {/* ---------- Demo ---------- */}
        <section className="au-section" id="demo">
          <div className="au-container">
            <div className="au-editorial">
              <div>
                <span className="au-eyebrow">Try it</span>
                <h2 className="au-heading-sm">Open a seeded account.</h2>
                <p className="au-body au-muted" style={{ marginTop: 16, maxWidth: '38ch' }}>
                  Both demo accounts come loaded with sample loads, matches and reviews. No
                  signup, no email, nothing to clean up afterwards.
                </p>
              </div>

              <div>
                <div className="au-card au-card--raised">
                  {error && <div className="au-notice">{error}</div>}

                  <span className="au-eyebrow">Choose a side</span>

                  <div className="au-stack au-stack--sm">
                    <button
                      type="button"
                      className="au-btn au-btn--primary au-btn--block"
                      onClick={() => enterDemo('SHIPPER')}
                      disabled={loadingRole !== null}
                    >
                      {loadingRole === 'SHIPPER' ? 'Starting…' : 'Explore as a shipper'}
                      {loadingRole !== 'SHIPPER' && <span aria-hidden="true">&rarr;</span>}
                    </button>

                    <button
                      type="button"
                      className="au-btn au-btn--secondary au-btn--block"
                      onClick={() => enterDemo('TRUCKER')}
                      disabled={loadingRole !== null}
                    >
                      {loadingRole === 'TRUCKER' ? 'Starting…' : 'Explore as a trucker'}
                    </button>
                  </div>

                  <p className="au-body-sm au-muted" style={{ marginTop: 20 }}>
                    Or <Link to="/login" className="au-link">log in</Link> to an account you
                    already have.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default HomePage;
