import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Deck from '../../components/Deck';
import { API_BASE } from '../../api';
import AppShell from '../../components/AppShell';

/**
 * Truckers who have put their hand up for one of this shipper's loads.
 * Swipe right to book them, left to pass.
 */
const PendingMatches = () => {
  const [pendingMatches, setPendingMatches] = useState([]);
  const [error, setError] = useState('');

  const fetchPendingMatches = async () => {
    try {
      const response = await axios.get(`${API_BASE}/matches`, { withCredentials: true });
      const { matches, userId } = response.data;
      setPendingMatches(
        matches.filter((match) => match.status === 'PENDING' && match.shipperId === userId)
      );
    } catch (err) {
      setError('Failed to fetch pending matches');
    }
  };

  useEffect(() => {
    fetchPendingMatches();
  }, []);

  const handleMatchResponse = async (direction, matchId) => {
    try {
      const status = direction === 'right' ? 'MATCHED' : 'REJECTED';
      await axios.post(
        `${API_BASE}/matches`,
        { matchId, status, action: 'respond' },
        { withCredentials: true }
      );
      fetchPendingMatches();
    } catch (err) {
      console.error('Failed to respond to match:', err);
      setError('Failed to respond to match');
    }
  };

  return (
    <AppShell
      eyebrow="Shipper"
      title="Pending matches."
      standfirst="Truckers who want one of your loads. Swipe right to book, left to pass."
    >
      {error && <div className="au-notice">{error}</div>}

      {pendingMatches.length === 0 && !error ? (
        <div className="au-empty">
          <h2 className="au-empty__title">No one waiting on you.</h2>
          <p className="au-empty__body">
            When a trucker swipes right on one of your loads, they land here for you to
            confirm or pass on.
          </p>
        </div>
      ) : (
        <div className="au-deck-frame">
          <Deck data={pendingMatches} onSwipe={handleMatchResponse} />
        </div>
      )}
    </AppShell>
  );
};

export default PendingMatches;
