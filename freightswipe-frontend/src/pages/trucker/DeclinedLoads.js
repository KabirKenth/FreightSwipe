import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../api';
import AppShell from '../../components/AppShell';
import Record, { formatRoute, formatEndpoints, formatMoney } from '../../components/Record';

const DeclinedLoads = () => {
  const [declinedLoads, setDeclinedLoads] = useState([]);
  const [error, setError] = useState('');

  const fetchDeclinedLoads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/matches`, { withCredentials: true });
      const { matches, userId } = response.data;
      setDeclinedLoads(
        matches.filter((match) => match.status === 'REJECTED' && match.truckerId === userId)
      );
    } catch (err) {
      setError('Failed to fetch declined loads');
    }
  };

  useEffect(() => {
    fetchDeclinedLoads();
  }, []);

  return (
    <AppShell
      eyebrow="Trucker"
      title="Passed on."
      standfirst="A record of the loads you swiped left on."
    >
      {error && <div className="au-notice">{error}</div>}

      {declinedLoads.length === 0 && !error && (
        <div className="au-empty">
          <h2 className="au-empty__title">Nothing passed on yet.</h2>
          <p className="au-empty__body">
            Loads you swipe left on are kept here so the board does not offer them again.
          </p>
          <Link to="/trucker/available-loads" className="au-btn au-btn--primary">
            Find loads <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}

      <div style={{ paddingBottom: 48 }}>
        {declinedLoads.map((match) => (
          <Record
            key={match.id}
            route={formatRoute(match.load.origin, match.load.destination)}
            endpoints={formatEndpoints(match.load.origin, match.load.destination)}
            status={match.status}
            meta={[
              { label: 'Shipper', value: match.shipper.name },
              { label: 'Budget', value: formatMoney(match.load.budget) },
            ]}
          />
        ))}
      </div>
    </AppShell>
  );
};

export default DeclinedLoads;
