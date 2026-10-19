import {
  interviewReviewStateSchema,
  type InterviewReviewState,
  type ReviewPlanStatus
} from '../schemas/interview-review-plan';
import { REVIEW_STATE_STORAGE_KEY } from '../scripts/storage-keys';
import type { ProgressStore } from './progress-storage';

// Estado del repaso en el navegador (ADR-0035). Este módulo es seguro para el
// bundle del navegador: el loader de planes con fs vive en
// `src/lib/interview-review-plan.ts`.

/** Clave de marca por tema: los id de item son unicos por plan, no globales. */
export function reviewMarkKey(slug: string, itemId: string): string {
  return `${slug}/${itemId}`;
}

export function emptyInterviewReviewState(): InterviewReviewState {
  return { version: 1, activeSlug: null, marks: {} };
}

export const interviewReviewStateStore: ProgressStore<InterviewReviewState> = {
  key: REVIEW_STATE_STORAGE_KEY,
  schema: interviewReviewStateSchema,
  empty: () => emptyInterviewReviewState()
};

export function itemStatus(
  state: InterviewReviewState,
  slug: string,
  itemId: string
): ReviewPlanStatus {
  return state.marks[reviewMarkKey(slug, itemId)] ?? 'pendiente';
}

export function setItemStatus(
  state: InterviewReviewState,
  slug: string,
  itemId: string,
  status: ReviewPlanStatus
): InterviewReviewState {
  const marks = { ...state.marks };
  if (status === 'pendiente') {
    delete marks[reviewMarkKey(slug, itemId)];
  } else {
    marks[reviewMarkKey(slug, itemId)] = status;
  }
  return { version: 1, activeSlug: state.activeSlug, marks };
}

export function setActiveSlug(
  state: InterviewReviewState,
  activeSlug: string | null
): InterviewReviewState {
  return { version: 1, activeSlug, marks: state.marks };
}
