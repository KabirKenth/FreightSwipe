import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';
import { TopNav, SiteFooter } from '../components/AppShell';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      const { user } = response.data;
      // The backend sets an HttpOnly cookie, so no token is stored client-side.

      if (user.role === 'SHIPPER') {
        navigate('/shipper/dashboard');
      } else if (user.role === 'TRUCKER') {
        navigate('/trucker/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="au-page">
      <TopNav />

      <main className="au-main">
        <div className="au-container au-section">
          <div className="au-column">
            <span className="au-eyebrow">Account</span>
            <h1 className="au-heading" style={{ marginBottom: 32 }}>Log in.</h1>

            {error && <div className="au-notice">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="au-field">
                <label className="au-label" htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  className="au-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="au-field">
                <label className="au-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="au-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className="au-btn au-btn--primary au-btn--block">
                Log in <span aria-hidden="true">&rarr;</span>
              </button>
            </form>

            <p className="au-body-sm au-muted" style={{ marginTop: 24 }}>
              Don’t have an account? <Link to="/signup" className="au-link">Sign up</Link>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default LoginPage;
