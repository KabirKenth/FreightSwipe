import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../api';
import AppShell from '../../components/AppShell';
import Record, { formatRoute, formatEndpoints } from '../../components/Record';

/**
 * Booked loads waiting on both sides to confirm the truck has rolled.
 */
const MatchedLoads = () => {
  const [matchedLoads, setMatchedLoads] = useState([]);
  const [error, setError] = useState('');

  const fetchMatchedLoads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/matches`, { withCredentials: true });
      setMatchedLoads(
        response.data.matches.filter(
          (match) => match.status === 'MATCHED' && match.load.status === 'MATCHED'
        )
      );
    } catch (err) {
      setError('Failed to fetch matched loads');
    }
  };

  useEffect(() => {
    fetchMatchedLoads();
  }, []);

  const handleUpdateLoadStatus = async (loadId, status) => {
    try {
      await axios.put(
        `${API_BASE}/loads/${loadId}/status`,
        { status },
        { withCredentials: true }
      );
      fetchMatchedLoads();
    } catch (err) {
      console.error('Failed to update load status:', err);
      setError('Failed to update load status');
    }
  };

  return (
    <AppShell
      eyebrow="Shipper"
      title="Matched loads."
      standfirst="Booked and waiting to roll. Both sides confirm before a load moves to in transit."
    >
      {error && <div className="au-notice">{error}</div>}

      {matchedLoads.length === 0 && !error && (
        <div className="au-empty">
          <h2 className="au-empty__title">Nothing booked right now.</h2>
          <p className="au-empty__body">
            Confirm a trucker from your pending matches and the load shows up here.
          </p>
          <Link to="/shipper/pending-matches" className="au-btn au-btn--primary">
            Review pending matches <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}

      <div style={{ paddingBottom: 48 }}>
        {matchedLoads.map((match) => (
          <Record
            key={match.id}
            route={formatRoute(match.load.origin, match.load.destination)}
            endpoints={formatEndpoints(match.load.origin, match.load.destination)}
            status={match.status}
            meta={[
              { label: 'Trucker', value: match.trucker.name },
              { label: 'Contact', value: match.trucker.email },
            ]}
          >
            {match.load.shipperInTransitConfirmed &&
              !match.load.truckerInTransitConfirmed && (
                <p className="au-notice au-notice--quiet" style={{ marginTop: 20, marginBottom: 0 }}>
                  Waiting for the trucker to confirm in transit.
                </p>
              )}

            {match.load.shipperInTransitConfirmed &&
              match.load.truckerInTransitConfirmed && (
                <p className="au-notice au-notice--signal" style={{ marginTop: 20, marginBottom: 0 }}>
                  Both sides confirmed. This load is in transit.
                </p>
              )}

            <div className="au-actions">
              {!match.load.shipperInTransitConfirmed && (
                <button
                  type="button"
                  className="au-btn au-btn--primary au-btn--sm"
                  onClick={() => handleUpdateLoadStatus(match.load.id, 'IN_TRANSIT')}
                >
                  Confirm in transit <span aria-hidden="true">&rarr;</span>
                </button>
              )}
              <Link
                to={`/reviews/${match.trucker.id}`}
                className="au-btn au-btn--secondary au-btn--sm"
              >
                View reviews
              </Link>
            </div>
          </Record>
        ))}
      </div>
    </AppShell>
  );
};

export default MatchedLoads;
