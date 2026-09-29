import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Reusable Error state component for API or data processing failures.
 */
export default function ErrorState({
  title = 'Failed to load data',
  message = 'An error occurred while fetching information from the incident response agent service.',
  onRetry,
}) {
  return (
    <div className="section-panel" style={{ textAlign: 'center', padding: '3rem 2rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#f87171' }}>
        <AlertTriangle size={36} />
      </div>
      <h3 style={{ fontSize: '1.15rem', color: '#f87171', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={16} />
          Retry Request
        </button>
      )}
    </div>
  );
}
