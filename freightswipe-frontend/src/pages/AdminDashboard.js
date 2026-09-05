import React from 'react';
import AppShell from '../components/AppShell';

const AdminDashboard = () => (
  <AppShell
    eyebrow="Admin"
    title="Admin dashboard."
    standfirst="Platform-level tooling lands here."
  >
    <div className="au-empty" style={{ marginBottom: 48 }}>
      <h2 className="au-empty__title">Nothing wired up yet.</h2>
      <p className="au-empty__body">
        This view is a placeholder. Load moderation, user management and dispute handling
        will sit here once the endpoints exist.
      </p>
    </div>
  </AppShell>
);

export default AdminDashboard;
