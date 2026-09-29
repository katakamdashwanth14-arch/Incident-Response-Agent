import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Loading state component with spinner and skeleton placeholders.
 */
export default function LoadingState({ message = 'Loading intelligence data...', rows = 3 }) {
  return (
    <div className="section-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#60a5fa' }}>
        <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        {message}
      </p>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-line" style={{ width: `${100 - i * 15}%`, height: '12px' }} />
        ))}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
