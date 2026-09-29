import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useIncidents } from '../context/useIncidents';

export default function DashboardPage() {
  const { incidents, memories, setActiveIncidentId } = useIncidents();
  const navigate = useNavigate();

  // Find active incidents
  const activeIncidents = incidents.filter((i) => i.status === 'Investigating' || i.status === 'Active');
  const primaryActiveIncident = activeIncidents[0] || incidents[0];
  const resolvedIncidents = incidents.filter((i) => i.status === 'Resolved');

  const handleOpenInvestigation = (id) => {
    setActiveIncidentId(id);
    navigate('/investigate');
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div>
          <div className="hero-greeting">Good morning.</div>
          <h2 className="hero-main-title">Incident Response Overview</h2>
          <p className="hero-tagline">
            Use historical incident knowledge to investigate problems and recover services faster.
          </p>
        </div>

        <div className="hero-actions">
          <Link to="/report" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>New Incident</span>
          </Link>
          <Link to="/history" className="btn btn-secondary">
            <span>View Incident History</span>
          </Link>
        </div>
      </div>

      {/* Three Elegant Metrics Strip */}
      <div className="metrics-strip">
        <div className="metric-card">
          <div className="metric-card-label">Active Incidents</div>
          <div className="metric-card-number" style={{ color: activeIncidents.length > 0 ? '#b91c1c' : '#0f172a' }}>
            0{activeIncidents.length}
          </div>
          <div className="metric-card-subtext">
            {activeIncidents.length > 0 ? 'Requires engineering investigation' : 'All systems operating within normal parameters'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">Resolved This Month</div>
          <div className="metric-card-number">42</div>
          <div className="metric-card-subtext">Average time to recovery: 18 minutes</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">Memory Events</div>
          <div className="metric-card-number">1,420</div>
          <div className="metric-card-subtext">Indexed post-mortems and root-cause solutions</div>
        </div>
      </div>

      {/* Active Incidents Area */}
      <div className="section-heading-group">
        <h3 className="section-main-heading">Active Incidents</h3>
        <Link to="/history" className="section-sub-link">
          All incidents ({incidents.length}) &rarr;
        </Link>
      </div>

      {primaryActiveIncident && (
        <div className="active-incident-card">
          <div className="incident-card-top-row">
            <span className="incident-id-badge">{primaryActiveIncident.id}</span>
            <div className="incident-badges-group">
              <span className={`badge-clean ${primaryActiveIncident.severity.toLowerCase()}`}>
                {primaryActiveIncident.severity.toUpperCase()}
              </span>
              <span className="badge-clean investigating">
                {primaryActiveIncident.status}
              </span>
            </div>
          </div>

          <h4 className="incident-card-title">{primaryActiveIncident.title}</h4>
          <p className="incident-card-summary">{primaryActiveIncident.summary}</p>

          <div className="incident-card-meta-row">
            <div className="incident-meta-details">
              <div className="meta-item">
                <span>Impact: </span>
                <strong>{primaryActiveIncident.blastRadius}</strong>
              </div>
              <div className="meta-item">
                <span>Timeline: </span>
                <strong>{primaryActiveIncident.startedAt}</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenInvestigation(primaryActiveIncident.id)}
            >
              <span>Open Investigation</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Recent Resolutions & Knowledge Retained */}
      <div className="section-heading-group" style={{ marginTop: '1.5rem' }}>
        <h3 className="section-main-heading">Recent Resolutions & Knowledge Retained</h3>
        <Link to="/memory" className="section-sub-link">
          Explore memory vault ({memories.length}) &rarr;
        </Link>
      </div>

      <div className="clean-table-container">
        <table className="clean-table">
          <thead>
            <tr>
              <th>Incident</th>
              <th>Impact</th>
              <th>Root Cause Identified</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {resolvedIncidents.slice(0, 3).map((inc) => (
              <tr key={inc.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="incident-id-col">{inc.id}</span>
                    <span className="incident-title-bold">{inc.title}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{inc.customersAffected} customers</td>
                <td style={{ color: 'var(--text-secondary)' }}>{inc.correlation?.rootCauseTitle || 'Resolved through standard recovery runbook'}</td>
                <td>
                  <span className="badge-clean resolved">
                    <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                    Resolved
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-subtle btn-sm"
                    onClick={() => handleOpenInvestigation(inc.id)}
                  >
                    Review &rarr;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
