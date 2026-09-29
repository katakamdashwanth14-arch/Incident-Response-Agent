import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Zap, ChevronDown, Sparkles, AlertTriangle } from 'lucide-react';
import { getHealthStatus } from '../services/healthService';
import { useIncidents } from '../context/useIncidents';

const PAGE_TITLES = {
  '/': 'Overview',
  '/report': 'New Incident',
  '/investigate': 'Investigation War Room',
  '/memory': 'Incident Memory',
  '/history': 'Incident History',
  '/post-mortem': 'Incident Post-Mortem',
};

const SCENARIOS = [
  {
    id: 'ap-db-pool',
    label: 'PostgreSQL Pool Saturation (P1)',
    service: 'payment-api',
    severity: 'Critical',
    desc: 'Asia-Pacific DB connection exhaustion & 503 spike',
  },
  {
    id: 'stripe-webhook',
    label: 'Stripe Webhook Timeout 504 (P2)',
    service: 'checkout-service',
    severity: 'High',
    desc: 'Synchronous handler thread starvation',
  },
  {
    id: 'kafka-lag',
    label: 'Kafka Partition Skew & Lag (P2)',
    service: 'analytics-pipeline',
    severity: 'High',
    desc: 'Consumer pod OOM & 850k message lag',
  },
];

export default function Header() {
  const [isOnline, setIsOnline] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { globalSearch, setGlobalSearch, triggerDemoScenario, isAnalyzing } = useIncidents();

  const currentTitle = PAGE_TITLES[location.pathname] || 'Overview';

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const data = await getHealthStatus();
        if (isMounted) {
          setIsOnline(data && data.status === 'ok');
        }
      } catch {
        if (isMounted) {
          setIsOnline(false);
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerScenario = async (scenarioId) => {
    setDropdownOpen(false);
    if (triggerDemoScenario) {
      await triggerDemoScenario(scenarioId);
      navigate('/investigate');
    }
  };

  return (
    <header className="aegis-top-header">
      {/* Left: Current Page Title */}
      <h1 className="header-left-title">{currentTitle}</h1>

      {/* Center/Right: Clean Search, Simulation Trigger & Profile */}
      <div className="header-right-actions">
        <div className="header-search-input-box">
          <Search size={15} className="search-icon-inside" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search incidents, memories..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
        </div>

        {/* Live Presentation Outage Simulator Dropdown */}
        <div className="scenario-simulator-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="btn-trigger-simulation"
            onClick={() => setDropdownOpen((prev) => !prev)}
            title="Simulate a live production outage for presentation demo"
            disabled={isAnalyzing}
          >
            <Zap size={14} className="zap-icon-pulse" />
            <span>{isAnalyzing ? 'Analyzing Outage...' : 'Simulate Outage'}</span>
            <ChevronDown size={13} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>

          {dropdownOpen && (
            <div className="simulator-dropdown-menu">
              <div className="simulator-dropdown-header">
                <Sparkles size={13} />
                <span>Live Hackathon Outage Scenarios</span>
              </div>
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  className="simulator-dropdown-item"
                  onClick={() => handleTriggerScenario(sc.id)}
                >
                  <div className="item-title-row">
                    <span className="item-name">{sc.label}</span>
                    <span className={`badge-pill badge-${sc.severity.toLowerCase()}`}>
                      {sc.severity}
                    </span>
                  </div>
                  <div className="item-desc">{sc.desc}</div>
                </button>
              ))}
              <div className="simulator-dropdown-footer">
                <AlertTriangle size={11} />
                <span>Triggers live agent triage & vector memory recall</span>
              </div>
            </div>
          )}
        </div>

        {/* Small System Status Pill */}
        <div
          className={`header-status-pill ${isOnline ? '' : 'offline'}`}
          title={isOnline ? 'FastAPI Backend Operational' : 'FastAPI Backend Disconnected'}
        >
          <span className={`system-status-dot ${isOnline ? '' : 'offline'}`} />
          <span>{isOnline ? 'All systems operational' : 'System degraded'}</span>
        </div>

        {/* Profile Avatar */}
        <div className="header-user-profile" title="Signed in as On-Call Incident Responder">
          <div className="user-avatar">SRE</div>
          <span>On-Call</span>
        </div>
      </div>
    </header>
  );
}
