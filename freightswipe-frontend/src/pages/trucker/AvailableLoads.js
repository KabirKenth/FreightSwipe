import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Deck from '../../components/Deck';
import { API_BASE } from '../../api';
import AppShell from '../../components/AppShell';

const AvailableLoads = () => {
  const [loads, setLoads] = useState([]);
  const [error, setError] = useState('');

  const fetchLoads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/loads/available`, {
        withCredentials: true,
      });
      const sortedLoads = response.data.sort(
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

  const handleSwipe = async (direction, loadId) => {
    try {
      if (direction === 'right') {
        await axios.post(
          `${API_BASE}/matches`,
          { loadId, status: 'PENDING', action: 'swipe' },
          { withCredentials: true }
        );
      } else if (direction === 'left') {
        await axios.post(
          `${API_BASE}/matches`,
          { loadId, status: 'REJECTED', action: 'swipe' },
          { withCredentials: true }
        );
      }
      setLoads(loads.filter((load) => load.id !== loadId));
    } catch (err) {
      console.error('Failed to swipe', err);
    }
  };

  return (
    <AppShell
      eyebrow="Trucker"
      title="Available loads."
      standfirst="Right to put your hand up, left to pass. An accept only opens the conversation — the shipper still has to confirm."
    >
      {error && <div className="au-notice">{error}</div>}

      {loads.length === 0 && !error ? (
        <div className="au-empty">
          <h2 className="au-empty__title">The board is clear.</h2>
          <p className="au-empty__body">
            Nothing is posted that you haven’t already answered. New loads show up here the
            moment a shipper puts one out.
          </p>
        </div>
      ) : (
        <div className="au-deck-frame">
          <Deck data={loads} onSwipe={handleSwipe} />
        </div>
      )}
    </AppShell>
  );
};

export default AvailableLoads;
