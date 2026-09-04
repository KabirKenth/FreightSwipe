import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';

/**
 * Landing page.
 *
 * Alongside the usual login/signup, this offers one-click demo access: the
 * /auth/demo endpoint signs the visitor in as a pre-seeded shipper or trucker so
 * the deployed app can be explored without registering.
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState('');

  const enterDemo = async (role) => {
    setError('');
    setLoadingRole(role);
    try {
      await axios.post(`${API_BASE}/auth/demo`, { role }, { withCredentials: true });
      navigate(role === 'SHIPPER' ? '/shipper/dashboard' : '/trucker/dashboard');
    } catch (err) {
      const message =
        err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Could not start the demo. Please try again.';
      setError(message);
      setLoadingRole(null);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 text-center">
          <h1 className="display-5 fw-bold">FreightSwipe</h1>
          <p className="lead text-muted mb-1">Swipe-to-match freight booking.</p>
          <p className="text-muted mb-5">
            Shippers post loads. Truckers swipe through the ones that fit. Both sides
            confirm pickup, track delivery, and review each other when it is done.
          </p>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h2 className="h5 mb-1">Try it without signing up</h2>
              <p className="text-muted small mb-4">
                Both accounts are loaded with sample loads, matches and reviews.
              </p>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                <button
                  type="button"
                  className="btn btn-primary btn-lg px-4"
                  onClick={() => enterDemo('SHIPPER')}
                  disabled={loadingRole !== null}
                >
                  {loadingRole === 'SHIPPER' ? 'Starting…' : 'Explore as a Shipper'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-lg px-4"
                  onClick={() => enterDemo('TRUCKER')}
                  disabled={loadingRole !== null}
                >
                  {loadingRole === 'TRUCKER' ? 'Starting…' : 'Explore as a Trucker'}
                </button>
              </div>
            </div>
          </div>

          <p className="text-muted small mb-0">
            Or <Link to="/login">log in</Link> · <Link to="/signup">create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
