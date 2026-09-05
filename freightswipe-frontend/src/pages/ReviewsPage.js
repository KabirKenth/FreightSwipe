import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE } from '../api';
import AppShell from '../components/AppShell';
import { formatRoute } from '../components/Record';

const ReviewsPage = () => {
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE}/reviews/${userId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const standfirst = loading
    ? 'Loading…'
    : `Average rating ${averageRating ? averageRating.toFixed(1) : '—'} across ${reviews.length} ${
        reviews.length === 1 ? 'review' : 'reviews'
      }.`;

  return (
    <AppShell eyebrow="Reputation" title="Reviews." standfirst={standfirst}>
      {error && <div className="au-notice">{error}</div>}

      {!loading && !error && reviews.length === 0 && (
        <div className="au-empty">
          <h2 className="au-empty__title">No reviews yet.</h2>
          <p className="au-empty__body">
            Reviews appear here once a load this account was part of has been delivered and
            the other side has left feedback.
          </p>
        </div>
      )}

      <div className="au-stack au-stack--sm" style={{ paddingBottom: 24 }}>
        {reviews.map((review) => (
          <article className="au-record" key={review.id}>
            <div className="au-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 className="au-record__route">{review.rating} / 5</h2>
              <span className="au-status au-status--resting">
                {review.reviewer.role}
              </span>
            </div>

            <p className="au-body" style={{ marginBottom: 20 }}>
              {review.comment || <span className="au-muted">No comment left.</span>}
            </p>

            <dl className="au-meta">
              <div className="au-meta__item">
                <dt className="au-meta__label">Reviewer</dt>
                <dd className="au-meta__value">{review.reviewer.name}</dd>
              </div>
              <div className="au-meta__item">
                <dt className="au-meta__label">Load</dt>
                <dd className="au-meta__value">
                  {formatRoute(review.load.origin, review.load.destination)}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </AppShell>
  );
};

export default ReviewsPage;
