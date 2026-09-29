import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { useIncidents } from '../context/useIncidents';

export default function IncidentHistoryPage() {
  const { incidents, setActiveIncidentId } = useIncidents();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const navigate = useNavigate();

  const filteredIncidents = incidents.filter((inc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      inc.id.toLowerCase().includes(q) ||
      inc.title.toLowerCase().includes(q) ||
      inc.service.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleOpenIncident = (id) => {
    setActiveIncidentId(id);
    navigate('/investigate');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          Incident History
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Audit trail of production incidents, identified root causes, and mean time to recovery.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="history-controls-row">
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-clean"
            style={{ paddingLeft: '2.25rem', paddingRight: '1rem', fontSize: '0.85rem' }}
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="history-filters-group">
          <select
            className="select-clean"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className="select-clean"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Clean Table / List Hybrid */}
      <div className="clean-table-container">
        <table className="clean-table">
          <thead>
            <tr>
              <th>Incident</th>
              <th>Impact</th>
              <th>Root Cause</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((inc) => (
                <tr key={inc.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="incident-id-col">{inc.id}</span>
                      <span className="incident-title-bold">{inc.title}</span>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{inc.service}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {inc.customersAffected ? `${inc.customersAffected} customers` : inc.blastRadius}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {inc.correlation?.rootCauseTitle || 'Identified via historical correlation'}
                  </td>
                  <td>
                    <span className={`badge-clean ${inc.status === 'Resolved' ? 'resolved' : 'investigating'}`}>
                      {inc.status === 'Resolved' ? <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> : null}
                      {inc.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {inc.startedAt}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-subtle btn-sm"
                      onClick={() => handleOpenIncident(inc.id)}
                    >
                      <span>Review</span>
                      <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No incidents match the active search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
