import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useIncidents } from '../context/useIncidents';

export default function ReportIncidentPage() {
  const { addIncident, setInvestigationStage } = useIncidents();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    title: 'Production API returning 503 errors',
    description: 'Orders API endpoint returning 503 Service Unavailable errors during flash-sale batch traffic. Users unable to complete purchases.',
    customersAffected: '12,500',
    regions: 'Asia-Pacific (Tokyo, Singapore)',
    service: 'Production API Gateway',
    severity: 'High',
    evidence: `503 Service Unavailable
POST /api/orders
Connection timeout
Database connection pool exhausted (active: 100/100, waiting: 142)`,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnalyzeSubmit = (e) => {
    e.preventDefault();
    addIncident(formData);
    setInvestigationStage('analyzing');
    navigate('/investigate');
  };

  return (
    <div className="guided-container">
      {/* Header */}
      <div className="guided-header">
        <h2 className="guided-title">Start an Investigation</h2>
        <p className="guided-subtitle">
          Tell Aegis what you're seeing. It will search previous incidents for relevant experience.
        </p>
      </div>

      {/* Subtle 3-Step Progress Indicator */}
      <nav className="stepper-nav" aria-label="Investigation Steps">
        <button
          type="button"
          className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          <span className="step-badge-number">01</span>
          <span>Incident</span>
        </button>

        <button
          type="button"
          className={`step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(2)}
        >
          <span className="step-badge-number">02</span>
          <span>Impact</span>
        </button>

        <button
          type="button"
          className={`step-item ${currentStep === 3 ? 'active' : ''}`}
          onClick={() => setCurrentStep(3)}
        >
          <span className="step-badge-number">03</span>
          <span>Diagnostics</span>
        </button>
      </nav>

      {/* Guided Step Cards */}
      <div className="guided-form-card">
        <form onSubmit={handleAnalyzeSubmit}>
          {/* STEP 01: Incident */}
          {currentStep === 1 && (
            <div>
              <div className="form-group-block">
                <label className="form-label-primary" htmlFor="title">
                  Incident title
                </label>
                <span className="form-label-hint">What is the immediate symptom or observed outage?</span>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="input-clean"
                  placeholder="e.g. Production API returning 503 errors"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-block">
                <label className="form-label-primary" htmlFor="description">
                  What are users or systems experiencing?
                </label>
                <span className="form-label-hint">Describe observed error behaviors, timing, and customer impact.</span>
                <textarea
                  id="description"
                  name="description"
                  className="input-clean"
                  rows={4}
                  placeholder="Describe what customers or downstream systems are reporting..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(2)}
                >
                  <span>Continue to Impact</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 02: Impact */}
          {currentStep === 2 && (
            <div>
              <div className="form-group-block">
                <label className="form-label-primary">Who is affected?</label>
                <span className="form-label-hint">Specify customer reach, geography, and impacted services.</span>

                <div className="input-grid-two" style={{ marginTop: '1rem' }}>
                  <div>
                    <label className="form-label-hint" htmlFor="customersAffected">Customers affected</label>
                    <input
                      id="customersAffected"
                      name="customersAffected"
                      type="text"
                      className="input-clean"
                      placeholder="e.g. 12,500"
                      value={formData.customersAffected}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="form-label-hint" htmlFor="regions">Affected regions</label>
                    <input
                      id="regions"
                      name="regions"
                      type="text"
                      className="input-clean"
                      placeholder="e.g. Asia-Pacific (Tokyo, Singapore)"
                      value={formData.regions}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="form-label-hint" htmlFor="service">Services affected</label>
                    <input
                      id="service"
                      name="service"
                      type="text"
                      className="input-clean"
                      placeholder="e.g. Production API Gateway"
                      value={formData.service}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="form-label-hint" htmlFor="severity">Severity</label>
                    <select
                      id="severity"
                      name="severity"
                      className="input-clean"
                      value={formData.severity}
                      onChange={handleChange}
                    >
                      <option value="High">High (Service outage / Critical SLA)</option>
                      <option value="Medium">Medium (Partial degradation / Workaround)</option>
                      <option value="Low">Low (Cosmetic / Internal telemetry)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(3)}
                >
                  <span>Continue to Diagnostics</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 03: Diagnostics */}
          {currentStep === 3 && (
            <div>
              <div className="form-group-block">
                <label className="form-label-primary" htmlFor="evidence">
                  What are you seeing?
                </label>
                <span className="form-label-hint">
                  Paste logs, stack traces, alerts or telemetry. Aegis parses error signatures to query memory.
                </span>

                <div className="developer-evidence-editor">
                  <div className="editor-top-bar">
                    <span>EVIDENCE INPUT // LOGS & STACK TRACES</span>
                    <span>RAW TEXT</span>
                  </div>
                  <textarea
                    id="evidence"
                    name="evidence"
                    className="editor-textarea"
                    value={formData.evidence}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Paste technical logs or alerts here..."
                  />
                </div>
              </div>

              <div className="form-submit-footer">
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft size={15} />
                    <span>Back</span>
                  </button>

                  <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                    <span>Analyze Incident</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                <p className="submit-disclaimer">
                  Aegis will compare this incident with historical incidents and documented resolutions.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
