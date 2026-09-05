import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../api';
import AppShell from '../../components/AppShell';
import Record, { formatRoute, formatEndpoints, formatWeight, formatMoney } from '../../components/Record';

/**
 * Delivered loads, with the review the shipper owes the trucker.
 */
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
      const response = await axios.get(`${API_BASE}/loads`, { withCredentials: true });
      const { loads, userId: id } = response.data;
      setCompletedLoads(loads.filter((load) => load.status === 'COMPLETED'));
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
      eyebrow="Shipper"
      title="Delivered."
      standfirst="Loads that made it. Leave the trucker a review while it is fresh."
    >
      {error && <div className="au-notice">{error}</div>}

      {completedLoads.length === 0 && !error && (
        <div className="au-empty">
          <h2 className="au-empty__title">No completed loads yet.</h2>
          <p className="au-empty__body">
            Once a load in transit is marked delivered, it moves here and both sides can
            review each other.
          </p>
          <Link to="/shipper/in-transit-loads" className="au-btn au-btn--primary">
            View loads in transit <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      )}

      <div style={{ paddingBottom: 48 }}>
        {completedLoads.map((load) => {
          const ownReview =
            Array.isArray(load.reviews) &&
            load.reviews.find((review) => review.reviewerId === userId);
          const matchedTrucker =
            load.matches && load.matches.length > 0 ? load.matches[0].trucker : null;

          return (
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
                    onClick={() => handleReview(load.id)}
                  >
                    Leave a review <span aria-hidden="true">&rarr;</span>
                  </button>
                )}
                {matchedTrucker && (
                  <Link
                    to={`/reviews/${matchedTrucker.id}`}
                    className="au-btn au-btn--secondary au-btn--sm"
                  >
                    All reviews for this trucker
                  </Link>
                )}
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
            <span className="au-help">Optional, but it is what the next shipper reads.</span>
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
