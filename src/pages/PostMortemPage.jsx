import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, BookmarkPlus, ArrowLeft, FileText, Send } from 'lucide-react';
import { useIncidents } from '../context/useIncidents';
import { getExportMarkdownUrl, notifyWarRoom } from '../services/incidentService';

export default function PostMortemPage() {
  const { incidents, activeIncidentId, saveIncidentToMemory } = useIncidents();
  const navigate = useNavigate();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [notifiedSuccess, setNotifiedSuccess] = useState(false);

  const incident = incidents.find((i) => i.id === activeIncidentId) || incidents[0];
  const correlation = incident.correlation || {};

  const handleSaveToMemory = async () => {
    await saveIncidentToMemory(incident.id);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportPDF = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      window.print();
      setDownloadSuccess(false);
    }, 300);
  };

  const handleDownloadMarkdown = () => {
    const url = getExportMarkdownUrl(incident.id);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `post-mortem-${incident.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNotifyWarRoom = async () => {
    try {
      await notifyWarRoom({
        incident_id: incident.id,
        channel: 'war-room-apac',
        summary: incident.title,
        root_cause: correlation.whatWeFound || 'Resolved anomaly',
        resolution: correlation.resolutionSummary?.resolution || 'Applied recovery runbook',
        status: incident.status || 'Resolved',
      });
      setNotifiedSuccess(true);
      setTimeout(() => setNotifiedSuccess(false), 4000);
    } catch (e) {
      console.warn('War room notification error:', e);
    }
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            type="button"
            className="btn btn-subtle btn-sm"
            onClick={() => navigate('/history')}
            style={{ marginBottom: '0.25rem', paddingLeft: 0 }}
          >
            <ArrowLeft size={14} />
            <span>Back to Incidents</span>
          </button>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Incident Post-Mortem Report
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadMarkdown}
            title="Download executive Markdown post-mortem"
          >
            <FileText size={15} />
            <span>Download .MD</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportPDF}
          >
            <Download size={15} />
            <span>{downloadSuccess ? 'Preparing...' : 'Export PDF'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleNotifyWarRoom}
            title="Dispatch incident update to Slack or Teams channel"
          >
            <Send size={14} />
            <span>{notifiedSuccess ? 'War Room Notified ✓' : 'Notify War Room'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveToMemory}
          >
            <BookmarkPlus size={15} />
            <span>{savedSuccess ? 'Retained in Memory ✓' : 'Retain in Memory'}</span>
          </button>
        </div>
      </div>

      {/* Professional Document Paper Layout */}
      <div className="report-paper-card">
        {/* Document Header Banner */}
        <div className="report-header-banner">
          <div>
            <h1 className="report-doc-title">Post-Mortem: {incident.id}</h1>
            <div className="report-doc-meta">
              <strong>Target Service:</strong> {incident.service} &bull; <strong>Severity:</strong> {incident.severity.toUpperCase()} &bull; <strong>Date:</strong> September 29, 2026
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge-clean resolved">
              Incident Resolved
            </span>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="report-section-block">
          <h3 className="report-section-title">1. Executive Summary</h3>
          <p className="report-text-body">
            On September 29, 2026, the {incident.service} experienced a service degradation resulting in 503 Service Unavailable errors for customer order requests. The incident was detected within 2 minutes of error rate threshold breach. Using historical memory correlation against incident MEM-012, the on-call team identified connection pool starvation as the primary failure mode and executed dynamic capacity scaling and connection reaping within 18 minutes.
          </p>
        </div>

        {/* 2. Customer & System Impact */}
        <div className="report-section-block">
          <h3 className="report-section-title">2. Customer & System Impact</h3>
          <p className="report-text-body">
            <strong>Duration:</strong> 18 minutes<br />
            <strong>Blast Radius:</strong> {incident.blastRadius}<br />
            <strong>Error Rate:</strong> Peak 34% HTTP 503 on POST /api/orders<br />
            <strong>Data Loss:</strong> None. Failed requests received clean retry-after signals.
          </p>
        </div>

        {/* 3. Incident Timeline */}
        <div className="report-section-block">
          <h3 className="report-section-title">3. Timeline</h3>
          <p className="report-text-body">
            <strong>14:02 UTC:</strong> Automated telemetry flagged elevated 503 errors on {incident.service}.<br />
            <strong>14:04 UTC:</strong> Aegis response agent initiated triage and parsed error stack traces.<br />
            <strong>14:06 UTC:</strong> Historical memory correlation identified MEM-012 (89% similarity).<br />
            <strong>14:09 UTC:</strong> Confirmed PgBouncer connection pool maxed at 100/100 connections.<br />
            <strong>14:14 UTC:</strong> Scaled pool ceiling to 200 and terminated unindexed reporting locks.<br />
            <strong>14:20 UTC:</strong> Error rate returned to 0% and p99 latency stabilized below 110ms.
          </p>
        </div>

        {/* 4. Technical Findings */}
        <div className="report-section-block">
          <h3 className="report-section-title">4. Technical Findings</h3>
          <p className="report-text-body">
            Backend database connections were held open by an unindexed order reconciliation query triggered by the scheduled accounting audit script. Because the query held shared row locks without an explicit query timeout, inbound transactional checkout requests queued up in PgBouncer until the pool wait timeout (5,000ms) expired.
          </p>
        </div>

        {/* 5. Historical Correlation */}
        <div className="report-section-block">
          <h3 className="report-section-title">5. Historical Correlation</h3>
          <p className="report-text-body">
            Aegis automatically matched this failure with <strong>{correlation.memoryId || 'MEM-012'} ({correlation.memoryTitle || 'PostgreSQL Connection Pool Saturation'})</strong>, documented on July 14, 2026. Both incidents shared the exact same tripartite signature: 503 HTTP gateway timeouts, database connection exhaustion, and client connection queue starvation.
          </p>
        </div>

        {/* 6. Root Cause */}
        <div className="report-section-block">
          <h3 className="report-section-title">6. Root Cause</h3>
          <p className="report-text-body">
            {correlation.whatWeFound || 'Long-running transactions consumed available database connections, preventing new API requests from obtaining a connection.'}
          </p>
        </div>

        {/* 7. Resolution & Verification */}
        <div className="report-section-block">
          <h3 className="report-section-title">7. Resolution</h3>
          <p className="report-text-body">
            {correlation.resolutionSummary?.resolution || 'Connection pool capacity increased to 200, idle transactions terminated, and read queries redirected to read replica.'}
          </p>
        </div>

        {/* 8. Lessons Learned */}
        <div className="report-section-block">
          <h3 className="report-section-title">8. Lessons Learned</h3>
          <p className="report-text-body">
            {correlation.resolutionSummary?.lessonLearned || 'Separate reporting and audit workloads from transactional user checkout workloads to eliminate lock contention.'}
          </p>
        </div>

        {/* 9. Preventive Actions */}
        <div className="report-section-block">
          <h3 className="report-section-title">9. Preventive Actions</h3>
          <p className="report-text-body">
            1. Enforce strict 2,000ms statement_timeout on all non-primary API connection pools.<br />
            2. Migrate background reconciliation scripts to point strictly to the read replica cluster.<br />
            3. Add synthetic health probes monitoring PgBouncer queue depth with alerting at 60% capacity.
          </p>
        </div>
      </div>
    </div>
  );
}
