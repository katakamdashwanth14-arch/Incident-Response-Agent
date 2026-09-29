import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable Empty State component with mission-control aesthetic.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No Data Available',
  description = 'There are currently no telemetry records matching the active criteria.',
  actionButton,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-radar">
        <div className="radar-sweep" />
        <div className="empty-state-icon">
          <Icon size={26} />
        </div>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionButton && <div className="empty-state-actions">{actionButton}</div>}
    </div>
  );
}
