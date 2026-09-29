import React from 'react';

/**
 * Reusable Tactical Badge component for severity levels (P1-P4) and incident statuses.
 */
export function SeverityBadge({ level }) {
  const normalized = (level || '').toUpperCase();
  let className = 'badge-p4';
  let label = level;

  if (normalized.includes('P1')) {
    className = 'badge-p1';
    label = 'P1 CRITICAL';
  } else if (normalized.includes('P2')) {
    className = 'badge-p2';
    label = 'P2 HIGH';
  } else if (normalized.includes('P3')) {
    className = 'badge-p3';
    label = 'P3 MEDIUM';
  } else if (normalized.includes('P4')) {
    className = 'badge-p4';
    label = 'P4 LOW';
  }

  return (
    <span className={`tactical-badge ${className}`}>
      <span className="badge-dot" />
      <span className="badge-text">{label}</span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  let className = 'investigating';

  if (normalized.includes('resolv')) {
    className = 'resolved';
  } else if (normalized.includes('active') || normalized.includes('critical')) {
    className = 'active';
  } else if (normalized.includes('investigat')) {
    className = 'investigating';
  }

  return (
    <span className={`tactical-badge badge-status ${className}`}>
      <span className="status-indicator-dot" />
      <span className="badge-text">{status}</span>
    </span>
  );
}


