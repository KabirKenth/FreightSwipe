import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreateLoadForm from '../components/CreateLoadForm';
import AppShell from '../components/AppShell';

const QUEUES = [
  { to: '/shipper/your-loads', label: 'Your loads' },
  { to: '/shipper/pending-matches', label: 'Pending matches' },
  { to: '/shipper/matched-loads', label: 'Matched loads' },
  { to: '/shipper/in-transit-loads', label: 'Loads in transit' },
  { to: '/shipper/completed-loads', label: 'Completed loads' },
];

/**
 * The main dashboard for shippers: post a load on the right, jump to any
 * queue from the index on the left.
 */
const ShipperDashboard = () => {
  const navigate = useNavigate();

  /** After a load is created, drop the shipper into the list it now appears in. */
  const handleNewLoad = () => {
    navigate('/shipper/your-loads');
  };

  return (
    <AppShell
      eyebrow="Shipper"
      title="Post a load."
      standfirst="Give the lane, the weight and the day it has to be there. Truckers see it the moment it goes up."
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
          <CreateLoadForm onNewLoad={handleNewLoad} />
        </div>
      </div>
    </AppShell>
  );
};

export default ShipperDashboard;
