import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  BookmarkPlus,
  FileText,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { useIncidents } from '../context/useIncidents';

export default function InvestigatePage() {
  const {
    incidents,
    setActiveIncidentId,
    selectedIncident,
    updateIncidentStatus,
    toggleRecoveryStep,
    saveIncidentToMemory,
    investigationStage,
    setInvestigationStage,
  } = useIncidents();

  const navigate = useNavigate();
  const incident = selectedIncident || incidents[0];

  // Simulating the smooth initial investigation timeline progression if stage is analyzing
  const [analysisStep, setAnalysisStep] = useState(3);
  const [memorySaved, setMemorySaved] = useState(false);
  const [copiedCommandId, setCopiedCommandId] = useState(null);

  const handleCopyCommand = (cmd, id) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommandId(id);
    setTimeout(() => setCopiedCommandId(null), 2000);
  };

  useEffect(() => {
    if (investigationStage === 'analyzing') {
      const t1 = setTimeout(() => setAnalysisStep(1), 400);
      const t2 = setTimeout(() => setAnalysisStep(2), 900);
      const t3 = setTimeout(() => setAnalysisStep(3), 1500);
      const t4 = setTimeout(() => {
        setAnalysisStep(4);
        setInvestigationStage('correlated');
      }, 2100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [investigationStage, setInvestigationStage]);

  const correlation = incident.correlation || {};
  const recoverySteps = correlation.recoverySteps || [];
  const completedStepsCount = recoverySteps.filter((s) => s.status === 'completed').length;
  const isAllStepsDone = recoverySteps.length > 0 && completedStepsCount === recoverySteps.length;
  const isResolved = incident.status === 'Resolved' || isAllStepsDone || investigationStage === 'resolved';

  const handleStepToggle = (stepId) => {
    toggleRecoveryStep(incident.id, stepId);
  };

  const handleSaveMemory = () => {
    saveIncidentToMemory(incident.id);
    setMemorySaved(true);
    setTimeout(() => {
      navigate('/memory');
    }, 1200);
  };

  return (
    <div className="investigation-container">
      {/* Presentation Mode / Investigation Stage Stepper */}
      <div className="presentation-stepper" aria-label="Investigation Workflow Stages">
        <button
          type="button"
          className={`presentation-stage-btn ${investigationStage === 'analyzing' ? 'active' : ''}`}
          onClick={() => setInvestigationStage('analyzing')}
        >
          <span>1. Understand</span>
        </button>
        <span className="presentation-divider-arrow">&rarr;</span>

        <button
          type="button"
          className={`presentation-stage-btn ${investigationStage === 'correlated' ? 'active' : ''}`}
          onClick={() => setInvestigationStage('correlated')}
        >
          <span>2. Remember & Correlate</span>
        </button>
        <span className="presentation-divider-arrow">&rarr;</span>

        <button
          type="button"
          className={`presentation-stage-btn ${investigationStage === 'root_cause' ? 'active' : ''}`}
          onClick={() => setInvestigationStage('root_cause')}
        >
          <span>3. Root Cause</span>
        </button>
        <span className="presentation-divider-arrow">&rarr;</span>

        <button
          type="button"
          className={`presentation-stage-btn ${investigationStage === 'recovery' ? 'active' : ''}`}
          onClick={() => setInvestigationStage('recovery')}
        >
          <span>4. Recovery</span>
        </button>
        <span className="presentation-divider-arrow">&rarr;</span>

        <button
          type="button"
          className={`presentation-stage-btn ${investigationStage === 'resolved' ? 'active' : ''}`}
          onClick={() => {
            updateIncidentStatus(incident.id, 'Resolved');
            setInvestigationStage('resolved');
          }}
        >
          <span>5. Resolve</span>
        </button>
        <span className="presentation-divider-arrow">&rarr;</span>

        <button
          type="button"
          className="presentation-stage-btn"
          onClick={() => navigate('/memory')}
        >
          <span>6. Learn</span>
        </button>
      </div>

      {/* Incident Header Context Strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span className="incident-id-col" style={{ fontSize: '1rem' }}>{incident.id}</span>
            <span className={`badge-clean ${incident.severity.toLowerCase()}`}>{incident.severity.toUpperCase()}</span>
            <span className={`badge-clean ${isResolved ? 'resolved' : 'investigating'}`}>
              {isResolved ? 'Resolved' : 'Investigating'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.015em' }}>
            {incident.title}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {incident.service} &bull; {incident.blastRadius}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="select-clean"
            value={incident.id}
            onChange={(e) => setActiveIncidentId(e.target.value)}
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.id}: {inc.service} ({inc.status})
              </option>
            ))}
          </select>

          {!isResolved ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                updateIncidentStatus(incident.id, 'Resolved');
                setInvestigationStage('resolved');
              }}
            >
              <CheckCircle2 size={14} color="#059669" />
              <span>Mark Resolved</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/post-mortem')}
            >
              <FileText size={14} />
              <span>View Post-Mortem</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. INVESTIGATION TIMELINE PROGRESSION (When actively analyzing) */}
      {investigationStage === 'analyzing' && (
        <div className="investigation-timeline-card">
          <h3 className="timeline-card-heading">Aegis is investigating</h3>

          <div className="investigation-steps-list">
            <div className={`investigation-step-row ${analysisStep >= 1 ? 'completed' : 'current'}`}>
              <span className="step-indicator-glyph done">✓</span>
              <span>Understanding incident symptoms</span>
            </div>

            <div className={`investigation-step-row ${analysisStep >= 2 ? 'completed' : analysisStep === 1 ? 'current' : ''}`}>
              <span className={`step-indicator-glyph ${analysisStep >= 2 ? 'done' : 'active'}`}>
                {analysisStep >= 2 ? '✓' : '●'}
              </span>
              <span>Analyzing technical evidence & stack trace</span>
            </div>

            <div className={`investigation-step-row ${analysisStep >= 3 ? 'completed' : analysisStep === 2 ? 'current' : ''}`}>
              <span className={`step-indicator-glyph ${analysisStep >= 3 ? 'done' : analysisStep === 2 ? 'active' : 'pending'}`}>
                {analysisStep >= 3 ? '✓' : analysisStep === 2 ? '●' : '○'}
              </span>
              <span>Searching incident memory vault</span>
            </div>

            <div className={`investigation-step-row ${analysisStep >= 4 ? 'completed' : analysisStep === 3 ? 'current' : ''}`}>
              <span className={`step-indicator-glyph ${analysisStep >= 4 ? 'done' : analysisStep === 3 ? 'active' : 'pending'}`}>
                {analysisStep >= 4 ? '✓' : analysisStep === 3 ? '●' : '○'}
              </span>
              <span>Correlating historical root causes</span>
            </div>

            <div className="investigation-step-row">
              <span className="step-indicator-glyph pending">○</span>
              <span>Preparing recovery actions</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MEMORY CORRELATION (THE SIGNATURE MOMENT OF THE PRESENTATION) */}
      <div className="memory-correlation-section">
        <div className="correlation-eyebrow">MEMORY CORRELATION</div>
        <h3 className="correlation-headline">We've seen something similar before.</h3>

        {/* Large Historical Incident Match Box */}
        <div className="historical-match-card">
          <div>
            <div className="historical-id-tag">{correlation.memoryId || 'MEM-012'}</div>
            <h4 className="historical-match-title">{correlation.memoryTitle || 'PostgreSQL Connection Pool Saturation'}</h4>
            <div className="historical-match-date">{correlation.memoryDate || 'July 14, 2026'}</div>
          </div>

          <div className="similarity-badge">
            <div className="similarity-score">{correlation.similarity || 89}%</div>
            <div className="similarity-label">Historical similarity</div>
          </div>
        </div>

        {/* Three Evidence Connections: Why this incident matches */}
        <div className="evidence-connections-heading">Why this incident matches</div>

        <div className="evidence-connections-diagram">
          <div className="evidence-box">
            <span className="evidence-box-label">Current incident</span>
            <span className="evidence-arrow-down">&darr;</span>
            <span className="evidence-box-value">503 Service Unavailable</span>
          </div>

          <div className="evidence-box">
            <span className="evidence-box-label">Historical incident</span>
            <span className="evidence-arrow-down">&darr;</span>
            <span className="evidence-box-value">Database connection exhaustion</span>
          </div>

          <div className="evidence-box">
            <span className="evidence-box-label">Shared signal</span>
            <span className="evidence-arrow-down">&darr;</span>
            <span className="evidence-box-value highlight">Connection pool saturation</span>
          </div>
        </div>

        <div className="memory-remembers-callout">
          <Sparkles size={16} />
          <span>Aegis remembers the exact resolution applied to {correlation.memoryId || 'MEM-012'}.</span>
        </div>
      </div>

      {/* 3. ROOT CAUSE ANALYSIS */}
      <div className="root-cause-card">
        <div className="root-cause-eyebrow">LIKELY ROOT CAUSE</div>
        <h3 className="root-cause-statement">{correlation.rootCauseTitle || 'Database connection pool saturation'}</h3>

        <div className="root-cause-found-box">
          <div className="section-mini-label">What we found</div>
          <p className="found-text">
            {correlation.whatWeFound || 'Long-running transactions consumed available database connections, preventing new API requests from obtaining a connection.'}
          </p>
        </div>

        <div className="section-mini-label">Evidence</div>
        <div className="evidence-checklist">
          {correlation.evidencePoints?.map((pt, idx) => (
            <div key={idx} className="evidence-check-item">
              <span className="check-icon-green">✓</span>
              <span>{pt}</span>
            </div>
          ))}
        </div>

        <div className="historical-evidence-strip">
          <span>{correlation.historicalEvidence || 'MEM-012 experienced the same failure pattern.'}</span>
          <Link to="/post-mortem" className="view-postmortem-link">
            <span>View historical post-mortem</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 4. RECOMMENDED RECOVERY PLAN */}
      {!isResolved && (
        <div className="recovery-card">
          <div className="recovery-header-row">
            <div>
              <h3 className="recovery-heading">Recommended Recovery</h3>
              <p className="recovery-subtitle">
                {correlation.recoverySubtitle || 'Actions derived from the documented resolution of MEM-012.'}
              </p>
            </div>

            <div className="recovery-progress-box">
              <span className="recovery-progress-label">
                Recovery: {completedStepsCount} / {recoverySteps.length} steps complete
              </span>
              <div className="thin-progress-track">
                <div
                  className="thin-progress-fill"
                  style={{ width: `${(completedStepsCount / (recoverySteps.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="recovery-timeline-list">
            {recoverySteps.map((step) => {
              const isCompleted = step.status === 'completed';
              return (
                <div
                  key={step.id}
                  className={`timeline-step-card ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="timeline-step-number">{step.stepNumber}</div>

                  <div className="timeline-step-content">
                    <h4 className="step-content-title">{step.title}</h4>
                    <p className="step-content-desc">{step.description}</p>
                    
                    {step.command && (
                      <div className="step-command-box">
                        <code>{step.command}</code>
                        <button
                          type="button"
                          className="btn-copy-command"
                          onClick={() => handleCopyCommand(step.command, step.id)}
                          title="Copy command to clipboard"
                        >
                          {copiedCommandId === step.id ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                          <span>{copiedCommandId === step.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}

                    <div className="step-expected-outcome">
                      <strong>Expected outcome:</strong> {step.expectedOutcome}
                    </div>
                  </div>

                  <div className="timeline-step-actions">
                    <button
                      type="button"
                      className={`btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleStepToggle(step.id)}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={14} color="#059669" />
                          <span>Complete</span>
                        </>
                      ) : (
                        <span>Mark complete</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. RESOLUTION SCREEN (SHOWN WHEN RESOLVED OR ALL STEPS COMPLETE) */}
      {isResolved && (
        <div className="resolution-card">
          <h3 className="resolution-hero-title">
            <CheckCircle2 size={24} />
            <span>Incident Resolved</span>
          </h3>
          <p className="resolution-subtitle">
            Service latency has returned to normal. Connection pool utilization stable at 18%.
          </p>

          <div className="resolution-summary-grid">
            <div>
              <div className="summary-col-label">Problem</div>
              <div className="summary-col-text">
                {correlation.resolutionSummary?.problem || '503 errors affecting production API'}
              </div>
            </div>

            <div>
              <div className="summary-col-label">Root Cause</div>
              <div className="summary-col-text">
                {correlation.resolutionSummary?.rootCause || 'Database connection pool saturation'}
              </div>
            </div>

            <div>
              <div className="summary-col-label">Resolution</div>
              <div className="summary-col-text">
                {correlation.resolutionSummary?.resolution || 'Connection pool capacity increased and long-running transactions addressed'}
              </div>
            </div>
          </div>

          <div className="resolution-learning-card">
            <div>
              <h4 className="learning-title">What Aegis learned</h4>
              <p className="learning-desc">
                Save this incident as a future memory to compound organizational intelligence.
              </p>
            </div>

            <div className="learning-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveMemory}
                disabled={memorySaved}
              >
                <BookmarkPlus size={16} />
                <span>{memorySaved ? 'Saved to Memory ✓' : 'Save to Incident Memory'}</span>
              </button>

              <Link to="/post-mortem" className="btn btn-secondary">
                <FileText size={16} />
                <span>Generate Post-Mortem</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
