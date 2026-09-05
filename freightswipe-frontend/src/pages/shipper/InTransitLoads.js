import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../api';
import AppShell from '../../components/AppShell';
import Record, { formatRoute, formatEndpoints } from '../../components/Record';

const InTransitLoads = () => {
  const [inTransitLoads, setInTransitLoads] = useState([]);
  const [error, setError] = useState('');

  const fetchInTransitLoads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/loads`, { withCredentials: true });
      setInTransitLoads(
        response.data.loads.filter((load) => load.status === 'IN_TRANSIT')
      );
    } catch (err) {
      setError('Failed to fetch in-transit loads');
    }
  };

  useEffect(() => {
    fetchInTransitLoads();
  }, []);

  const handleUpdateLoadStatus = async (loadId, status) => {
    try {
      await axios.put(
        `${API_BASE}/loads/${loadId}/status`,
        { status },
        { withCredentials: true }
      );
      fetchInTransitLoads();
    } catch (err) {
      console.error('Failed to update load status:', err);
      setError('Failed to update load status');
    }
  };

  return (
    <AppShell
      eyebrow="Shipper"
      title="On the road."
      standfirst="Loads that have left the dock. Mark one delivered once it lands."
    >
      {error && <div className="au-notice">{error}</div>}

      {inTransitLoads.length === 0 && !error && (
        <div className="au-empty">
          <h2 className="au-empty__title">Nothing moving right now.</h2>
          <p className="au-empty__body">
            Once you and the trucker both confirm a booked load has been picked up, it
            appears here until delivery.
          </p>
          <Link to="/shipper/matched-loads" className="au-btn au-btn--primary">
            View matched loads <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}

      <div style={{ paddingBottom: 48 }}>
        {inTransitLoads.map((load) => {
          const matchedTrucker =
            load.matches && load.matches.length > 0
              ? load.matches.find((match) => match.status === 'MATCHED')?.trucker
              : null;

          return (
            <Record
              key={load.id}
              route={formatRoute(load.origin, load.destination)}
              endpoints={formatEndpoints(load.origin, load.destination)}
              status={load.status}
              meta={[
                { label: 'Trucker', value: matchedTrucker?.name },
                { label: 'Contact', value: matchedTrucker?.email },
              ]}
            >
              <div className="au-actions">
                <button
                  type="button"
                  className="au-btn au-btn--primary au-btn--sm"
                  onClick={() => handleUpdateLoadStatus(load.id, 'COMPLETED')}
                >
                  Mark delivered <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </Record>
          );
        })}
      </div>
    </AppShell>
  );
};

export default InTransitLoads;
