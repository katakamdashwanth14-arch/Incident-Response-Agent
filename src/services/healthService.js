import { request } from './api';

/**
 * Checks backend health status.
 * Target: GET /api/health
 * Returns: { status: "ok", service: "incident-response-agent" }
 */
export async function getHealthStatus() {
  return await request('/api/health');
}
