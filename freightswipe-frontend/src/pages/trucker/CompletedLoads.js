import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../api';
import AppShell from '../../components/AppShell';
import Record, { formatRoute, formatEndpoints, formatMoney } from '../../components/Record';

const CompletedLoads = () => {
  const [completedLoads, setCompletedLoads] = useState([]);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewLoadId, setReviewLoadId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const fetchCompletedLoads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/matches`, { withCredentials: true });
      const { matches, userId: id } = response.data;
      setCompletedLoads(
        matches.filter(
          (match) =>
            match.status === 'MATCHED' &&
            match.load &&
            match.load.status === 'COMPLETED' &&
            match.truckerId === id
        )
      );
      setUserId(id);
    } catch (err) {
      setError('Failed to fetch completed loads');
    }
  };

  useEffect(() => {
    fetchCompletedLoads();
  }, []);

  const handleReview = (loadId) => {
    setReviewLoadId(loadId);
    setShowReviewForm(true);
  };

  const handleSubmitReview = async () => {
    if (reviewRating < 1 || reviewRating > 5) {
      setError('Rating must be between 1 and 5.');
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/reviews`,
        { loadId: reviewLoadId, rating: parseInt(reviewRating, 10), comment: reviewComment },
        { withCredentials: true }
      );
      setShowReviewForm(false);
      setReviewLoadId(null);
      setReviewRating(5);
      setReviewComment('');
      setError('');
      fetchCompletedLoads();
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError('Failed to submit review');
    }
  };

  return (
    <AppShell
      eyebrow="Trucker"
      title="Delivered."
      standfirst="Loads you have run. Leave the shipper a review while it is fresh."
    >
      {error && <div className="au-notice">{error}</div>}

      {completedLoads.length === 0 && !error && (
        <div className="au-empty">
          <h2 className="au-empty__title">No completed loads yet.</h2>
          <p className="au-empty__body">
            Once a load you carried is marked delivered, it moves here and both sides can
            review each other.
          </p>
          <Link to="/trucker/available-loads" className="au-btn au-btn--primary">
            Find loads <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}

      <div style={{ paddingBottom: 48 }}>
        {completedLoads.map((match) => {
          const ownReview =
            Array.isArray(match.load.reviews) &&
            match.load.reviews.find((review) => review.reviewerId === userId);

          return (
            <Record
              key={match.id}
              route={formatRoute(match.load.origin, match.load.destination)}
              endpoints={formatEndpoints(match.load.origin, match.load.destination)}
              status={match.load.status}
              meta={[
                { label: 'Shipper', value: match.shipper.name },
                { label: 'Contact', value: match.shipper.email },
                { label: 'Budget', value: formatMoney(match.load.budget) },
              ]}
            >
              {ownReview && (
                <div className="au-notice au-notice--quiet" style={{ marginTop: 20, marginBottom: 0 }}>
                  <span className="au-eyebrow" style={{ marginBottom: 4 }}>
                    Your review — {ownReview.rating}/5
                  </span>
                  {ownReview.comment || 'No comment left.'}
                </div>
              )}

              <div className="au-actions">
                {!ownReview && (
                  <button
                    type="button"
                    className="au-btn au-btn--primary au-btn--sm"
                    onClick={() => handleReview(match.load.id)}
                  >
                    Leave a review <span aria-hidden="true">&rarr;</span>
                  </button>
                )}
                <Link
                  to={`/reviews/${match.shipper.id}`}
                  className="au-btn au-btn--secondary au-btn--sm"
                >
                  All reviews for this shipper
                </Link>
              </div>
            </Record>
          );
        })}
      </div>

      {showReviewForm && (
        <div className="au-card au-card--raised" style={{ marginBottom: 48, maxWidth: 540 }}>
          <span className="au-eyebrow">Leave a review</span>

          <div className="au-field">
            <label className="au-label" htmlFor="review-rating">Rating (1–5)</label>
            <input
              id="review-rating"
              type="number"
              className="au-input"
              min="1"
              max="5"
              value={reviewRating}
              onChange={(e) => setReviewRating(e.target.value)}
              required
            />
          </div>

          <div className="au-field">
            <label className="au-label" htmlFor="review-comment">Comment</label>
            <textarea
              id="review-comment"
              className="au-textarea"
              rows="3"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            <span className="au-help">Optional, but it is what the next trucker reads.</span>
          </div>

          <div className="au-actions" style={{ marginTop: 0 }}>
            <button type="button" className="au-btn au-btn--primary" onClick={handleSubmitReview}>
              Submit review <span aria-hidden="true">&rarr;</span>
            </button>
            <button
              type="button"
              className="au-btn au-btn--secondary"
              onClick={() => setShowReviewForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default CompletedLoads;
