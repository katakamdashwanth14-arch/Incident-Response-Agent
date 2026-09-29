/**
 * Aegis Incident Response Agent - Full API Service Client.
 * Connects frontend with backend memory, AI investigation agent,
 * live scenario simulation, and post-mortem export endpoints.
 */

import { request } from './api';

export async function fetchHealth() {
  return request('/api/health');
}

export async function fetchMemoryStats() {
  return request('/api/memory/stats');
}

export async function fetchAllMemories() {
  return request('/api/memory/all');
}

export async function recallMemories(query, tags = null, limit = 5) {
  return request('/api/memory/recall', {
    method: 'POST',
    body: JSON.stringify({ query, tags, limit }),
  });
}

export async function retainMemory(payload) {
  return request('/api/memory/retain', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function analyzeIncident(payload) {
  return request('/api/investigate/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchScenarios() {
  return request('/api/scenarios');
}

export async function triggerScenario(scenarioId) {
  return request(`/api/scenarios/trigger/${scenarioId}`, {
    method: 'POST',
  });
}

export async function notifyWarRoom(payload) {
  return request('/api/export/notify-war-room', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getExportMarkdownUrl(incidentId) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${baseUrl}/api/export/post-mortem/${incidentId}/markdown`;
}

export default {
  fetchHealth,
  fetchMemoryStats,
  fetchAllMemories,
  recallMemories,
  retainMemory,
  analyzeIncident,
  fetchScenarios,
  triggerScenario,
  notifyWarRoom,
  getExportMarkdownUrl,
};
