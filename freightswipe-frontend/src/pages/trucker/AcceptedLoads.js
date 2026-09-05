import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../api';
import AppShell from '../../components/AppShell';
import Record, { formatRoute, formatEndpoints, formatMoney } from '../../components/Record';

/**
 * Loads this trucker swiped right on that the shipper has not answered yet.
 */
const AcceptedLoads = () => {
  const [acceptedLoads, setAcceptedLoads] = useState([]);
  const [error, setError] = useState('');

  const fetchAcceptedLoads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/matches`, { withCredentials: true });
      const { matches, userId } = response.data;
      setAcceptedLoads(
        matches.filter((match) => match.status === 'PENDING' && match.truckerId === userId)
      );
    } catch (err) {
      setError('Failed to fetch accepted loads');
    }
  };

  useEffect(() => {
    fetchAcceptedLoads();
  }, []);

  return (
    <AppShell
      eyebrow="Trucker"
      title="Awaiting the shipper."
      standfirst="Loads you have accepted. Nothing is committed until the shipper confirms you."
    >
      {error && <div className="au-notice">{error}</div>}

      {acceptedLoads.length === 0 && !error && (
        <div className="au-empty">
          <h2 className="au-empty__title">No open offers.</h2>
          <p className="au-empty__body">
            Swipe right on a load and it waits here until the shipper picks a trucker.
          </p>
          <Link to="/trucker/available-loads" className="au-btn au-btn--primary">
            Find loads <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}

      <div style={{ paddingBottom: 48 }}>
        {acceptedLoads.map((match) => (
          <Record
            key={match.id}
            route={formatRoute(match.load.origin, match.load.destination)}
            endpoints={formatEndpoints(match.load.origin, match.load.destination)}
            status={match.status}
            meta={[
              { label: 'Shipper', value: match.shipper.name },
              { label: 'Contact', value: match.shipper.email },
              { label: 'Budget', value: formatMoney(match.load.budget) },
            ]}
          />
        ))}
      </div>
    </AppShell>
  );
};

export default AcceptedLoads;
