import React from 'react';

/**
 * The record card every load and match list renders.
 *
 * Aurora has no green or red to code status with, so a record reads through
 * hierarchy instead: the route is the subheading, the endpoints recede to Slate
 * Whisper, and the figures sit in a hairline-separated meta strip that mirrors
 * the landing page's hero stats bar.
 */

/** "Toronto, ON → Montreal, QC" */
export const formatRoute = (origin, destination) => {
  const end = (place) =>
    [place?.city, place?.province].filter(Boolean).join(', ') || 'Unknown';
  return `${end(origin)} → ${end(destination)}`;
};

/** "18,400 lbs" -- figures in the meta strip are grouped, per editorial style. */
export const formatWeight = (lbs) =>
  lbs === undefined || lbs === null || lbs === '' ? '' : `${Number(lbs).toLocaleString()} lbs`;

/** "$2,250" */
export const formatMoney = (amount) =>
  amount === undefined || amount === null || amount === '' ? '' : `$${Number(amount).toLocaleString()}`;

/** "123 King St W to 456 Rue Sherbrooke" */
export const formatEndpoints = (origin, destination) =>
  `${origin?.address || 'Address pending'} to ${destination?.address || 'address pending'}`;

/** Statuses that still need someone to act step up to the ink. */
const TONE = {
  PENDING: 'signal',
  MATCHED: 'active',
  IN_TRANSIT: 'active',
  COMPLETED: 'resting',
  REJECTED: 'resting',
  CANCELLED: 'resting',
};

export const Status = ({ value }) => (
  <span className={`au-status au-status--${TONE[value] || 'resting'}`}>
    {String(value || '').replace(/_/g, ' ') || 'Unknown'}
  </span>
);

export const Meta = ({ items }) => (
  <dl className="au-meta">
    {items
      .filter((item) => item && item.value !== undefined && item.value !== null && item.value !== '')
      .map((item) => (
        <div className="au-meta__item" key={item.label}>
          <dt className="au-meta__label">{item.label}</dt>
          <dd className="au-meta__value">{item.value}</dd>
        </div>
      ))}
  </dl>
);

const Record = ({ route, endpoints, meta = [], status, children }) => (
  <article className="au-record">
    <div className="au-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
      <h2 className="au-record__route">{route}</h2>
      {status && <Status value={status} />}
    </div>

    {endpoints && <p className="au-record__endpoints">{endpoints}</p>}

    {meta.length > 0 && <Meta items={meta} />}

    {children}
  </article>
);

export default Record;
