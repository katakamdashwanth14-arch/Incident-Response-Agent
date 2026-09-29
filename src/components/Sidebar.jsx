import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  Brain,
  FileText,
  Settings,
} from 'lucide-react';
import { getHealthStatus } from '../services/healthService';

/**
 * Custom Shield + Memory Node SVG Icon
 * Communicates protection, memory, and calm reliability.
 */
function AegisShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L4 5V11C4 16.52 7.41 21.61 12 22.88C16.59 21.61 20 16.52 20 11V5L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" fill="currentColor" />
      <path d="M12 8.5V6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 16v-2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9.5 11H7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M17 11h-2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/report', label: 'New Incident', icon: PlusCircle },
  { path: '/history', label: 'Incidents', icon: Clock },
  { path: '/memory', label: 'Memory', icon: Brain },
  { path: '/post-mortem', label: 'Reports', icon: FileText },
];

export default function Sidebar() {
  const [isOnline, setIsOnline] = useState(true);

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

  return (
    <aside className="aegis-sidebar">
      {/* Brand Header */}
      <Link to="/" className="sidebar-brand">
        <div className="brand-shield-icon">
          <AegisShieldIcon />
        </div>
        <div className="brand-meta">
          <span className="brand-name">AEGIS</span>
          <span className="brand-subtitle">Incident Response Agent</span>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="sidebar-nav-list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              <div className="nav-link-icon">
                <Icon size={18} />
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="system-status-indicator" title={isOnline ? 'All backend systems operational' : 'Backend degraded'}>
          <span className={`system-status-dot ${isOnline ? '' : 'offline'}`} />
          <span>{isOnline ? 'All systems operational' : 'System Degraded'}</span>
        </div>

        <div className="sidebar-secondary-links">
          <button type="button" className="sidebar-secondary-btn" onClick={() => alert('Settings: Aegis Incident Response Platform v2.4 (Enterprise Edition)')}>
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
