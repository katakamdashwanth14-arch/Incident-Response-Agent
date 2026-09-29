import { useContext } from 'react';
import { IncidentContext } from './createIncidentContext';

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
}
