import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE, errorMessage } from '../../api';
import AppShell from '../../components/AppShell';
import Record, { formatRoute, formatEndpoints, formatWeight, formatMoney } from '../../components/Record';
import ConfirmAction from '../../components/ConfirmAction';

/**
 * Every load this shipper has created, newest first.
 */
const YourLoads = () => {
  const [loads, setLoads] = useState([]);
  const [error, setError] = useState('');

  const fetchLoads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/loads`, { withCredentials: true });
      const sortedLoads = response.data.loads.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLoads(sortedLoads);
    } catch (err) {
      setError('Failed to fetch loads');
    }
  };

  useEffect(() => {
    fetchLoads();
  }, []);

  // The confirmation lives in <ConfirmAction>, not in a window.confirm dialog:
  // Aurora has no red to mark a destructive button with, so the guard is an
  // explicit second step instead of a colour.
  const handleDeleteLoad = async (loadId) => {
    try {
      await axios.delete(`${API_BASE}/loads/${loadId}`, { withCredentials: true });
      setLoads(loads.filter((load) => load.id !== loadId));
    } catch (err) {
      console.error('Failed to delete load:', err);
      setError('Failed to delete load');
    }
  };

  const handleCancelLoad = async (loadId) => {
    try {
      await axios.post(`${API_BASE}/loads/${loadId}/cancel`, {}, { withCredentials: true });
      fetchLoads();
    } catch (err) {
      console.error('Failed to cancel load:', err);
      setError(errorMessage(err, 'Failed to cancel load'));
    }
  };

  return (
    <AppShell
      eyebrow="Shipper"
      title="Your loads."
      standfirst={`${loads.length} ${loads.length === 1 ? 'load' : 'loads'} posted, newest first.`}
    >
      {error && <div className="au-notice">{error}</div>}

      {loads.length === 0 && !error && (
        <div className="au-empty">
          <h2 className="au-empty__title">You haven’t posted a load yet.</h2>
          <p className="au-empty__body">
            Post a lane with its weight, budget and deadline and it goes straight onto the
            board for truckers to swipe through.
          </p>
          <a href="/shipper/dashboard" className="au-btn au-btn--primary">
            Post a load <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      )}

      <div style={{ paddingBottom: 48 }}>
        {loads.map((load) => (
          <Record
            key={load.id}
            route={formatRoute(load.origin, load.destination)}
            endpoints={formatEndpoints(load.origin, load.destination)}
            status={load.status}
            meta={[
              { label: 'Weight', value: formatWeight(load.weight) },
              { label: 'Budget', value: formatMoney(load.budget) },
              { label: 'Deadline', value: new Date(load.deadline).toLocaleDateString() },
            ]}
          >
            {load.status === 'PENDING' && (
              <ConfirmAction
                label="Delete load"
                prompt="Delete this load? It comes off the board straight away and cannot be restored."
                confirmLabel="Delete this load"
                onConfirm={() => handleDeleteLoad(load.id)}
              />
            )}

            {load.status === 'MATCHED' && (
              <ConfirmAction
                label="Cancel load"
                prompt="Cancel this load? The trucker loses the booking and a $5 fee is charged to your account."
                confirmLabel="Cancel and pay the $5 fee"
                cancelLabel="Keep the booking"
                onConfirm={() => handleCancelLoad(load.id)}
              />
            )}
          </Record>
        ))}
      </div>
    </AppShell>
  );
};

export default YourLoads;
