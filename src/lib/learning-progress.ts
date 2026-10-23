import {
  learningProgressSchema,
  type LearningGateStatus,
  type LearningProgress,
  type LearningResourceStatus,
  type PlanEvidence,
  type PlanPhase
} from '../schemas/learning-plan';
import { LEARNING_PROGRESS_STORAGE_KEY } from '../scripts/storage-keys';
import type { ProgressStore } from './progress-storage';

export const LEARNING_RESOURCE_STATUSES: LearningResourceStatus[] = [
  'sin-marcar',
  'en-curso',
  'hecho',
  'skipped'
];

export const LEARNING_RESOURCE_STATUS_LABELS: Record<LearningResourceStatus, string> = {
  'sin-marcar': 'Sin marcar',
  'en-curso': 'En curso',
  hecho: 'Hecho',
  skipped: 'Skipped'
};

export const LEARNING_GATE_STATUSES: LearningGateStatus[] = ['pendiente', 'cumplido'];

export const LEARNING_GATE_STATUS_LABELS: Record<LearningGateStatus, string> = {
  pendiente: 'Pendiente',
  cumplido: 'Cumplido'
};

export function emptyLearningProgress(): LearningProgress {
  return { version: 1, entries: {}, gates: {} };
}

export const learningProgressStore: ProgressStore<LearningProgress> = {
  key: LEARNING_PROGRESS_STORAGE_KEY,
  schema: learningProgressSchema,
  empty: () => emptyLearningProgress()
};

export function resourceStatus(
  progress: LearningProgress,
  resourceId: string
): LearningResourceStatus {
  return progress.entries[resourceId]?.status ?? 'sin-marcar';
}

export function gateStatus(progress: LearningProgress, phaseId: string): LearningGateStatus {
  return progress.gates[phaseId]?.status ?? 'pendiente';
}

/** Citas de evidencia del gate de una fase (ADR-0041); vacias si no tiene. */
export function gateEvidence(phase: Pick<PlanPhase, 'gateEvidence'>): PlanEvidence[] {
  return phase.gateEvidence ?? [];
}

/**
 * Estado VISIBLE del gate, derivado (ADR-0041): nunca se guarda ni se inventa.
 * Con citas de evidencia el estado es "con-evidencia" y el marcado manual no
 * aplica (el dueño de la evidencia es quien produce las citas, p. ej. memento);
 * sin citas, el estado es el marcado manual del usuario o "pendiente".
 */
export type GateDisplayState = 'con-evidencia' | 'marcado-a-mano' | 'pendiente';

export function gateDisplayState(
  phase: Pick<PlanPhase, 'id' | 'gateEvidence'>,
  progress: LearningProgress
): GateDisplayState {
  if (gateEvidence(phase).length > 0) return 'con-evidencia';
  return gateStatus(progress, phase.id) === 'cumplido' ? 'marcado-a-mano' : 'pendiente';
}

export function setResourceStatus(
  progress: LearningProgress,
  resourceId: string,
  status: LearningResourceStatus
): LearningProgress {
  const entries = { ...progress.entries };
  if (status === 'sin-marcar') {
    delete entries[resourceId];
  } else {
    entries[resourceId] = { status };
  }
  return { version: 1, entries, gates: progress.gates };
}

export function setGateStatus(
  progress: LearningProgress,
  phaseId: string,
  status: LearningGateStatus
): LearningProgress {
  const gates = { ...progress.gates };
  if (status === 'pendiente') {
    delete gates[phaseId];
  } else {
    gates[phaseId] = { status };
  }
  return { version: 1, entries: progress.entries, gates };
}

export interface LearningProgressSummary {
  markedResources: number;
  totalResources: number;
  metGates: number;
  totalGates: number;
  evidenceGates: number;
  manualGates: number;
}

export function summarizeProgress(
  progress: LearningProgress,
  resourceIds: string[],
  phases: Pick<PlanPhase, 'id' | 'gateEvidence'>[]
): LearningProgressSummary {
  const evidenceGates = phases.filter((phase) => gateEvidence(phase).length > 0).length;
  const manualGates = phases.filter(
    (phase) => gateDisplayState(phase, progress) === 'marcado-a-mano'
  ).length;
  return {
    markedResources: resourceIds.filter((id) => resourceStatus(progress, id) !== 'sin-marcar').length,
    totalResources: resourceIds.length,
    metGates: evidenceGates + manualGates,
    totalGates: phases.length,
    evidenceGates,
    manualGates
  };
}
