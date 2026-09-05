import React from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Reveal from '../components/Reveal';

const QUEUES = [
  { to: '/trucker/available-loads', label: 'Available loads' },
  { to: '/trucker/matched-loads', label: 'Matched loads' },
  { to: '/trucker/in-transit-loads', label: 'Loads in transit' },
  { to: '/trucker/accepted-loads', label: 'Awaiting shipper' },
  { to: '/trucker/completed-loads', label: 'Completed loads' },
  { to: '/trucker/declined-loads', label: 'Declined loads' },
];

const TruckerDashboard = () => (
  <AppShell
    eyebrow="Trucker"
    title="Find your next lane."
    standfirst="Swipe through the loads that fit your capacity. Nothing is committed until the shipper confirms."
    aside={
      <Link to="/trucker/available-loads" className="au-btn au-btn--primary">
        Start swiping <span aria-hidden="true">&rarr;</span>
      </Link>
    }
  >
    <div className="au-editorial" style={{ paddingBottom: 48 }}>
      <div>
        <span className="au-eyebrow">Your queues</span>
        <ul className="au-index">
          {QUEUES.map((queue) => (
            <li key={queue.to}>
              <Link to={queue.to} className="au-index__link">
                {queue.label}
                <span className="au-index__arrow" aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Reveal>
          Every load on the board carries its lane, its weight, its budget and its deadline
          up front, so a pass costs you a second and an accept costs you nothing until the
          shipper agrees.
        </Reveal>
      </div>
    </div>
  </AppShell>
);

export default TruckerDashboard;
