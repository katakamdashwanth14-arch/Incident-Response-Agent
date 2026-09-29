import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { IncidentProvider } from '../context/IncidentContext';

/**
 * Enterprise Application Shell Layout.
 * Clean, calm, modern layout shell for presentation-ready incident response.
 */
export default function Layout() {
  return (
    <IncidentProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="main-wrapper">
          <Header />
          <main className="page-wrapper">
            <Outlet />
          </main>
        </div>
      </div>
    </IncidentProvider>
  );
}
