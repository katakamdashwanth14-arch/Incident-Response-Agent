import React from 'react';

/**
 * Tactical Telemetry Metric Card
 * Displays title, value, icon, accent glow, and trend/subtext indicator.
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  accentColor = '#38bdf8',
  subtitle,
  trend,
  trendPositive,
  progress,
}) {
  return (
    <div className="stat-card" style={{ '--card-accent': accentColor }}>
      <div className="stat-card-glow-bg" />
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={17} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        {trend && (
          <span className={`stat-card-trend ${trendPositive ? 'positive' : 'neutral'}`}>
            {trend}
          </span>
        )}
      </div>

      {progress !== undefined && (
        <div className="stat-card-progress-bar">
          <div
            className="stat-card-progress-fill"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%`, backgroundColor: accentColor }}
          />
        </div>
      )}

      {subtitle && <div className="stat-card-footer">{subtitle}</div>}
    </div>
  );
}
