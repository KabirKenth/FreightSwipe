import React from 'react';

/**
 * Stops one bad render from blanking the whole app.
 *
 * Without a boundary, React unmounts the entire tree on an uncaught render
 * error and the user is left staring at a white page with nothing to act on.
 * This catches it and shows something in the Aurora language instead, with a
 * way back.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="au-page">
        <main className="au-main">
          <div className="au-container au-section">
            <div className="au-column">
              <span className="au-eyebrow">Something went wrong</span>
              <h1 className="au-heading" style={{ marginBottom: 24 }}>
                This page stopped short.
              </h1>
              <p className="au-body au-muted" style={{ marginBottom: 32 }}>
                Reloading usually clears it. If it keeps happening, the details are in
                the browser console.
              </p>
              <button
                type="button"
                className="au-btn au-btn--primary"
                onClick={() => window.location.reload()}
              >
                Reload the page <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default ErrorBoundary;
