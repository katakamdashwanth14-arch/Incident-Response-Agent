import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  AlertTriangle,
  SearchCode,
  FileCheck2,
  BrainCircuit,
  History,
  Volume2,
  VolumeX,
  Zap,
  ArrowRight,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useIncidents } from '../context/useIncidents';
import { soundFX } from '../utils/soundEffects';

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    incidents,
    setActiveIncidentId,
    soundEnabled,
    toggleSound,
    triggerSimulatedDrill,
  } = useIncidents();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (commandPaletteOpen) {
      const timer = setTimeout(() => {
        setQuery('');
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const quickNav = [
    { id: 'nav-dash', type: 'Nav', title: 'Operational Command Hub', subtitle: 'View main telemetry and war room metrics', icon: LayoutDashboard, action: () => navigate('/') },
    { id: 'nav-inv', type: 'Nav', title: 'Incident Investigation War Room', subtitle: 'Autonomous root cause and runbook execution', icon: SearchCode, action: () => navigate('/investigate') },
    { id: 'nav-rep', type: 'Nav', title: 'Report Production Incident', subtitle: 'Dispatch autonomous agent to triage a new issue', icon: AlertTriangle, action: () => navigate('/report') },
    { id: 'nav-pm', type: 'Nav', title: 'Post-Mortem Synthesis', subtitle: 'Document failure chain and commit to memory', icon: FileCheck2, action: () => navigate('/post-mortem') },
    { id: 'nav-mem', type: 'Nav', title: 'Hindsight Memory Vault', subtitle: 'Browse vector embeddings and historical lessons', icon: BrainCircuit, action: () => navigate('/memory') },
    { id: 'nav-hist', type: 'Nav', title: 'Incident Audit History', subtitle: 'Chronological telemetry and MTTR statistics', icon: History, action: () => navigate('/history') },
  ];

  const incidentActions = incidents.map((inc) => ({
    id: `inc-${inc.id}`,
    type: 'Incident',
    title: `${inc.id}: ${inc.service}`,
    subtitle: `${inc.severity} • ${inc.title}`,
    icon: Flame,
    action: () => {
      setActiveIncidentId(inc.id);
      navigate('/investigate');
    },
  }));

  const systemActions = [
    {
      id: 'sys-drill',
      type: 'Action',
      title: 'Simulate Live P1 Production Outage',
      subtitle: 'Trigger synthetic incident to test autonomous agent response',
      icon: Zap,
      action: () => {
        const drill = triggerSimulatedDrill();
        setActiveIncidentId(drill.id);
        navigate('/investigate');
      },
    },
    {
      id: 'sys-sound',
      type: 'Action',
      title: soundEnabled ? 'Mute War Room Audio FX' : 'Enable Tactical Audio FX',
      subtitle: soundEnabled ? 'Sound is currently active' : 'Turn on audio clicks and alert chimes',
      icon: soundEnabled ? VolumeX : Volume2,
      action: () => toggleSound(),
    },
  ];

  const allItems = [...quickNav, ...incidentActions, ...systemActions];
  const filtered = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      soundFX.playClick();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      soundFX.playClick();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setCommandPaletteOpen(false);
        soundFX.playClick();
      }
    }
  };

  return (
    <div
      className="cmd-overlay"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="cmd-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cmd-header">
          <Search size={18} className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command, search incidents, runbooks, memories..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="cmd-kbd-badge">ESC to close</span>
        </div>

        <div className="cmd-results">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                    soundFX.playClick();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="cmd-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="cmd-item-content">
                    <div className="cmd-item-title-row">
                      <span className="cmd-item-title">{item.title}</span>
                      <span className={`cmd-type-tag ${item.type.toLowerCase()}`}>{item.type}</span>
                    </div>
                    <span className="cmd-item-sub">{item.subtitle}</span>
                  </div>
                  {isSelected && <ArrowRight size={14} className="cmd-enter-icon" />}
                </div>
              );
            })
          ) : (
            <div className="cmd-empty">
              <Sparkles size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p>No matching commands or incidents found for "{query}"</p>
            </div>
          )}
        </div>

        <div className="cmd-footer">
          <div className="cmd-tips">
            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
            <span><kbd>esc</kbd> to exit</span>
          </div>
          <div className="cmd-brand">AEGIS IR-AGENT • v2.4</div>
        </div>
      </div>
    </div>
  );
}
