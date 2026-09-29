import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_INCIDENTS, INITIAL_MEMORIES } from './initialData';
import { IncidentContext } from './createIncidentContext';
import {
  fetchAllMemories,
  analyzeIncident,
  triggerScenario,
  retainMemory,
} from '../services/incidentService';

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [memories, setMemories] = useState(INITIAL_MEMORIES);
  const [activeIncidentId, setActiveIncidentId] = useState('INC-029');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [investigationStage, setInvestigationStage] = useState('correlated');

  // Load memories from backend API on mount
  useEffect(() => {
    let isMounted = true;
    fetchAllMemories()
      .then((backendMemories) => {
        if (isMounted && Array.isArray(backendMemories) && backendMemories.length > 0) {
          const formatted = backendMemories.map((m) => ({
            id: m.id,
            title: m.root_cause ? m.root_cause.slice(0, 50) + '...' : `${m.service} Post-Mortem`,
            date: m.created_at || '2026-07-14',
            category: m.category || 'Database',
            service: m.service,
            rootCause: m.root_cause,
            resolution: m.resolution,
            lesson: m.lessons_learned,
            impact: m.symptoms,
            relatedIncidents: [m.incident_id],
            evidenceLinks: m.evidence_links || [],
            similarity: m.similarity,
          }));
          setMemories(formatted);
        }
      })
      .catch((err) => {
        console.warn('Backend memories fetch failed, using pre-seeded store:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedIncident = useMemo(() => {
    return incidents.find((i) => i.id === activeIncidentId) || incidents[0];
  }, [incidents, activeIncidentId]);

  const addIncident = async (newIncidentData) => {
    const nextIdNumber = incidents.length + 30;
    const newId = `INC-0${nextIdNumber}`;
    setIsAnalyzing(true);

    let correlationData = {
      memoryId: 'MEM-012',
      memoryTitle: 'PostgreSQL Connection Pool Saturation',
      memoryDate: 'July 14, 2026',
      similarity: 89,
      sharedSignals: [
        { current: '503 Service Unavailable', historical: 'Database connection exhaustion', signal: 'Connection pool saturation' },
        { current: 'Connection timeout on order API', historical: 'Reporting query transaction lock', signal: 'Long-running transaction holding pool slots' },
        { current: 'Active sockets saturated', historical: 'Client connection queue starvation', signal: 'Pool exhaustion failure pattern' },
      ],
      rootCauseTitle: 'Database connection pool saturation',
      whatWeFound: 'Long-running transactions consumed available database connections, preventing new API requests from obtaining a connection.',
      evidencePoints: [
        'Connection pool saturation (100% active sockets occupied)',
        'Long-running transaction holding row locks in order_receipts',
        'Matching historical failure pattern with MEM-012',
      ],
      historicalEvidence: 'MEM-012 experienced the same failure pattern during high-volume batch processing.',
      recoverySubtitle: 'Actions derived from the documented resolution of MEM-012.',
      recoverySteps: [
        {
          id: 1,
          stepNumber: '01',
          title: 'Scale PgBouncer Connection Pool Capacity',
          description: 'Temporarily expand PgBouncer client pool size to absorb the queued traffic surge.',
          expectedOutcome: 'PgBouncer queued clients drop from 420 to <10 within 60 seconds.',
          status: 'completed',
        },
        {
          id: 2,
          stepNumber: '02',
          title: 'Terminate Stale Idle In Transaction Sockets',
          description: 'Kill backend connections lingering in idle in transaction state over 60 seconds.',
          expectedOutcome: 'Frees up approximately 35-45 stalled database connections immediately.',
          status: 'completed',
        },
        {
          id: 3,
          stepNumber: '03',
          title: 'Apply the approved recovery',
          description: 'Increase pool capacity dynamically to 200 and terminate idle-in-transaction connections.',
          expectedOutcome: 'Restore order creation endpoint availability and lower p99 latency below 120ms.',
          status: 'in_progress',
        },
      ],
      resolutionSummary: {
        problem: newIncidentData.title,
        rootCause: 'Database connection pool saturation caused by unindexed batch queries',
        resolution: 'Connection pool capacity increased to 200 and idle transactions terminated',
        lessonLearned: 'Separate reporting workloads from transactional workloads to prevent shared lock contention.',
      },
    };

    // Call live AI agent backend
    try {
      const report = await analyzeIncident({
        incident_id: newId,
        title: newIncidentData.title || 'Production Service Degradation',
        service: newIncidentData.service || 'payment-api',
        severity: newIncidentData.severity || 'High',
        symptoms: newIncidentData.description || 'Observed anomaly during user traffic',
        evidence: newIncidentData.evidence || '',
        impact: newIncidentData.impact || '',
      });

      if (report && report.root_cause_hypothesis) {
        correlationData = {
          memoryId: report.matched_memory?.id || 'MEM-012',
          memoryTitle: report.matched_memory?.service ? `${report.matched_memory.service} Incident Precedent` : 'Historical Precedent',
          memoryDate: report.matched_memory?.created_at || 'July 14, 2026',
          similarity: Math.round((report.confidence_score || 0.89) * 100),
          sharedSignals: (report.evidence_findings || []).map((finding, idx) => ({
            current: finding,
            historical: report.matched_memory?.symptoms ? report.matched_memory.symptoms.slice(0, 40) + '...' : 'Matching pattern',
            signal: `Signal ${idx + 1}`,
          })),
          rootCauseTitle: report.root_cause_hypothesis.slice(0, 50) + '...',
          whatWeFound: report.root_cause_hypothesis,
          evidencePoints: report.evidence_findings || [],
          historicalEvidence: report.correlation_reasoning,
          recoverySubtitle: `Action plan synthesized by Aegis AI Agent (${report.estimated_recovery_minutes}m estimated recovery).`,
          recoverySteps: (report.recovery_plan || []).map((step, idx) => ({
            id: idx + 1,
            stepNumber: `0${step.step_number || idx + 1}`,
            title: step.title,
            description: step.description,
            command: step.command,
            expectedOutcome: step.expected_outcome,
            safetyCheck: step.safety_check,
            status: idx === 0 ? 'completed' : 'in_progress',
          })),
          resolutionSummary: {
            problem: newIncidentData.title,
            rootCause: report.root_cause_hypothesis,
            resolution: (report.recovery_plan || []).map((r) => r.title).join('; '),
            lessonLearned: report.lessons_learned_preview,
          },
        };
      }
    } catch (err) {
      console.warn('Backend analysis call failed, using heuristic model:', err.message);
    } finally {
      setIsAnalyzing(false);
    }

    const newIncident = {
      id: newId,
      service: newIncidentData.service || 'Production Service',
      severity: newIncidentData.severity || 'High',
      title: newIncidentData.title || 'Production Service Degradation',
      summary: newIncidentData.description || 'Observed anomaly during user traffic',
      status: 'Investigating',
      startedAt: 'Just now',
      detectedTimestamp: new Date().toISOString(),
      blastRadius: newIncidentData.impact || `${newIncidentData.customersAffected || '10,000+'} customers affected across ${newIncidentData.regions || 'multiple regions'}`,
      customersAffected: newIncidentData.customersAffected || '10,000+',
      regions: newIncidentData.regions || 'Global',
      errorRate: 'Elevated 5xx errors',
      evidenceSnippet: newIncidentData.evidence || '503 Service Unavailable\nConnection timeout observed on endpoint',
      correlation: correlationData,
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setActiveIncidentId(newId);
    setInvestigationStage('correlated');
    return newIncident;
  };

  const triggerDemoScenario = useCallback(async (scenarioId) => {
    setIsAnalyzing(true);
    try {
      const res = await triggerScenario(scenarioId);
      if (res && res.incident && res.investigation) {
        const inv = res.investigation;
        const inc = res.incident;

        const newInc = {
          id: inc.id,
          service: inc.service,
          severity: inc.severity,
          title: inc.title,
          summary: inc.symptoms,
          status: 'Investigating',
          startedAt: 'Just now',
          detectedTimestamp: new Date().toISOString(),
          blastRadius: inc.impact,
          customersAffected: '12,500',
          regions: 'Asia-Pacific (APAC)',
          errorRate: '14.8% HTTP 503',
          evidenceSnippet: inc.evidence,
          correlation: {
            memoryId: inv.matched_memory?.id || 'MEM-012',
            memoryTitle: inv.matched_memory?.service ? `${inv.matched_memory.service} Precedent` : 'Historical Precedent',
            memoryDate: inv.matched_memory?.created_at || 'July 14, 2026',
            similarity: Math.round((inv.confidence_score || 0.94) * 100),
            sharedSignals: (inv.evidence_findings || []).map((finding, idx) => ({
              current: finding,
              historical: inv.matched_memory?.symptoms ? inv.matched_memory.symptoms.slice(0, 45) + '...' : 'Precedent failure pattern',
              signal: `Signal 0${idx + 1}`,
            })),
            rootCauseTitle: inv.root_cause_hypothesis.slice(0, 50) + '...',
            whatWeFound: inv.root_cause_hypothesis,
            evidencePoints: inv.evidence_findings || [],
            historicalEvidence: inv.correlation_reasoning,
            recoverySubtitle: `Live AI agent runbook (${inv.estimated_recovery_minutes}m target resolution).`,
            recoverySteps: (inv.recovery_plan || []).map((step, idx) => ({
              id: idx + 1,
              stepNumber: `0${step.step_number || idx + 1}`,
              title: step.title,
              description: step.description,
              command: step.command,
              expectedOutcome: step.expected_outcome,
              safetyCheck: step.safety_check,
              status: idx === 0 ? 'completed' : 'in_progress',
            })),
            resolutionSummary: {
              problem: inc.title,
              rootCause: inv.root_cause_hypothesis,
              resolution: (inv.recovery_plan || []).map((r) => r.title).join('; '),
              lessonLearned: inv.lessons_learned_preview,
            },
          },
        };

        setIncidents((prev) => [newInc, ...prev]);
        setActiveIncidentId(inc.id);
        setInvestigationStage('correlated');
        return newInc;
      }
    } catch (err) {
      console.error('Trigger demo scenario error:', err);
    } finally {
      setIsAnalyzing(false);
    }
    return null;
  }, []);

  const updateIncidentStatus = (id, newStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
  };

  const toggleRecoveryStep = (incidentId, stepId) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId || !inc.correlation?.recoverySteps) return inc;
        const updatedSteps = inc.correlation.recoverySteps.map((step) => {
          if (step.id === stepId) {
            return {
              ...step,
              status: step.status === 'completed' ? 'in_progress' : 'completed',
            };
          }
          return step;
        });

        const allDone = updatedSteps.every((s) => s.status === 'completed');
        const newStatus = allDone ? 'Resolved' : inc.status;

        return {
          ...inc,
          status: newStatus,
          correlation: {
            ...inc.correlation,
            recoverySteps: updatedSteps,
          },
        };
      })
    );
  };

  const saveIncidentToMemory = async (incidentId) => {
    const targetInc = incidents.find((i) => i.id === incidentId);
    if (!targetInc) return null;

    const newMemId = `MEM-0${memories.length + 14}`;
    const newMemory = {
      id: newMemId,
      title: targetInc.correlation?.rootCauseTitle || `${targetInc.service} Failure`,
      date: 'September 29, 2026',
      category: 'Database',
      service: targetInc.service,
      rootCause: targetInc.correlation?.whatWeFound || 'System anomaly resolved.',
      resolution: targetInc.correlation?.resolutionSummary?.resolution || 'Applied standard recovery procedure.',
      lesson: targetInc.correlation?.resolutionSummary?.lessonLearned || 'Documented mitigation steps for future automated retrieval.',
      impact: targetInc.blastRadius,
      relatedIncidents: [targetInc.id],
      evidenceLinks: targetInc.correlation?.evidencePoints || [],
      similarity: 0.95,
    };

    setMemories((prev) => [newMemory, ...prev]);

    // Retain to backend memory service
    try {
      await retainMemory({
        incident_id: targetInc.id,
        service: targetInc.service,
        category: 'Database',
        symptoms: targetInc.summary,
        root_cause: targetInc.correlation?.whatWeFound || 'Resolved anomaly',
        resolution: targetInc.correlation?.resolutionSummary?.resolution || 'Recovery runbook executed',
        lessons_learned: targetInc.correlation?.resolutionSummary?.lessonLearned || 'Operational lessons learned',
        tags: [targetInc.service.toLowerCase(), targetInc.severity.toLowerCase(), 'retained'],
        evidence_links: targetInc.correlation?.evidencePoints || [],
      });
    } catch (e) {
      console.warn('Backend retain call fallback:', e.message);
    }

    return newMemory;
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        activeIncidentId,
        setActiveIncidentId,
        selectedIncident,
        memories,
        globalSearch,
        setGlobalSearch,
        isAnalyzing,
        investigationStage,
        setInvestigationStage,
        addIncident,
        triggerDemoScenario,
        updateIncidentStatus,
        toggleRecoveryStep,
        saveIncidentToMemory,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
}

export default IncidentProvider;
