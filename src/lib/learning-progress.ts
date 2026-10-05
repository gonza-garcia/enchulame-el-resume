import {
  learningProgressSchema,
  type LearningGateStatus,
  type LearningProgress,
  type LearningResourceStatus
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
}

export function summarizeProgress(
  progress: LearningProgress,
  resourceIds: string[],
  phaseIds: string[]
): LearningProgressSummary {
  return {
    markedResources: resourceIds.filter((id) => resourceStatus(progress, id) !== 'sin-marcar').length,
    totalResources: resourceIds.length,
    metGates: phaseIds.filter((id) => gateStatus(progress, id) === 'cumplido').length,
    totalGates: phaseIds.length
  };
}
