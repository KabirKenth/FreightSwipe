import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../api';
import { TopNav, SiteFooter } from '../components/AppShell';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SHIPPER');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE}/auth/signup`,
        { name, email, password, role },
        { withCredentials: true }
      );
      const { user } = response.data;

      if (user.role === 'SHIPPER') {
        navigate('/shipper/dashboard');
      } else if (user.role === 'TRUCKER') {
        navigate('/trucker/dashboard');
      }
    } catch (err) {
      setError('Email already exists');
    }
  };

  return (
    <div className="au-page">
      <TopNav />

      <main className="au-main">
        <div className="au-container au-section">
          <div className="au-column">
            <span className="au-eyebrow">Account</span>
            <h1 className="au-heading" style={{ marginBottom: 32 }}>Create an account.</h1>

            {error && <div className="au-notice">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="au-field">
                <label className="au-label" htmlFor="signup-name">Name</label>
                <input
                  id="signup-name"
                  type="text"
                  className="au-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="au-field">
                <label className="au-label" htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  type="email"
                  className="au-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="au-field">
                <label className="au-label" htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  className="au-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="au-field">
                <label className="au-label" htmlFor="signup-role">I am a</label>
                <select
                  id="signup-role"
                  className="au-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="SHIPPER">Shipper — I have loads to move</option>
                  <option value="TRUCKER">Trucker — I have capacity to fill</option>
                </select>
                <span className="au-help">This decides which side of the match you see.</span>
              </div>

              <button type="submit" className="au-btn au-btn--primary au-btn--block">
                Create account <span aria-hidden="true">&rarr;</span>
              </button>
            </form>

            <p className="au-body-sm au-muted" style={{ marginTop: 24 }}>
              Already have an account? <Link to="/login" className="au-link">Log in</Link>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default SignupPage;
