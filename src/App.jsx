import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Page components
import DashboardPage from './pages/DashboardPage';
import ReportIncidentPage from './pages/ReportIncidentPage';
import InvestigatePage from './pages/InvestigatePage';
import PostMortemPage from './pages/PostMortemPage';
import MemoryPage from './pages/MemoryPage';
import IncidentHistoryPage from './pages/IncidentHistoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="report" element={<ReportIncidentPage />} />
          <Route path="investigate" element={<InvestigatePage />} />
          <Route path="post-mortem" element={<PostMortemPage />} />
          <Route path="memory" element={<MemoryPage />} />
          <Route path="history" element={<IncidentHistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
