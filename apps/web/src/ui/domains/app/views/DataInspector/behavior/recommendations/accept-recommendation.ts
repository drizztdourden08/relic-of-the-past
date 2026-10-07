/* @layer renderer-app @kind logic */
/**
 * The one place a recommendation turns into a dataset write. The three actions
 * reuse `RECORD_CREATORS`, `RECORD_WRITERS` and `recordDeleterFor`, so a
 * finding goes through the same path as a hand edit; a second write path would
 * be a second thing to keep in step with the emitters.
 *
 * Order matters at the tail: `markWritten` and the verdict come only after the
 * dataset write has landed, so a failed write leaves the finding open.
 */
import { RECORD_CREATORS } from '../record-creators';
import { RECORD_WRITERS } from '../record-writers';
import { recordDeleterFor } from '../delete-record';
import { markWritten } from '../review-store';
import { decideRecommendation } from './recommendation-cache';
import type { EntityKind } from '@shared/game/data';
import type { Recommendation } from '@shared/game/recommendations';
import type { InspectorRow } from '../../DataInspector.type';

interface AcceptOutcome {
  success: boolean;
  /** The record the write landed on. A create allocates one, other writes use the target. */
  id?: string;
  error?: string;
}

const NO_PATH = (kind: EntityKind, action: string): string =>
  `No ${action} path is wired for the ${kind} collection.`;
const NO_TARGET = 'This finding names no record to change.';
const FAILED = 'The write failed.';

const failed = (error: unknown): AcceptOutcome =>
  ({ success: false, error: error instanceof Error ? error.message : FAILED });

const create = async (kind: EntityKind, proposed: InspectorRow): Promise<AcceptOutcome> => {
  const creator = RECORD_CREATORS[kind];
  if (!creator) return { success: false, error: NO_PATH(kind, 'create') };
  const result = await creator(proposed);
  return result.success ? { success: true, id: result.id } : { success: false, error: result.error };
};

/** Keyed by `targetId`, the identity the store reconciles on, not the payload's own id. */
const update = async (kind: EntityKind, id: string, proposed: InspectorRow): Promise<AcceptOutcome> => {
  const writer = RECORD_WRITERS[kind];
  if (!writer) return { success: false, error: NO_PATH(kind, 'write') };
  await writer({ ...proposed, id });
  return { success: true, id };
};

const remove = async (kind: EntityKind, id: string): Promise<AcceptOutcome> => {
  const deleter = recordDeleterFor(kind);
  if (!deleter) return { success: false, error: NO_PATH(kind, 'delete') };
  const result = await deleter(id);
  return result.success ? { success: true, id } : { success: false, error: result.error ?? FAILED };
};

const applyTo = (
  entry: Recommendation,
  proposed: InspectorRow,
): Promise<AcceptOutcome> => {
  const kind = entry.kind;
  if (entry.action === 'create') return create(kind, proposed);
  if (!entry.targetId) return Promise.resolve({ success: false, error: NO_TARGET });
  if (entry.action === 'delete') return remove(kind, entry.targetId);
  return update(kind, entry.targetId, proposed);
};

/** Applies one finding and closes it out. `proposed` is passed in so the reviewer's edited draft is what gets written. */
const acceptRecommendation = async (
  entry: Recommendation,
  proposed: InspectorRow,
): Promise<AcceptOutcome> => {
  let outcome: AcceptOutcome;
  try {
    outcome = await applyTo(entry, proposed);
  } catch (error: unknown) {
    outcome = failed(error);
  }
  if (!outcome.success) return outcome;

  if (outcome.id) markWritten(entry.kind, outcome.id);
  await decideRecommendation(entry.kind, entry.id, 'accepted');
  return outcome;
};

/** A verdict with no dataset write behind it. */
const dismissRecommendation = (entry: Recommendation): Promise<void> =>
  decideRecommendation(entry.kind, entry.id, 'dismissed');

export { acceptRecommendation, dismissRecommendation };
export type { AcceptOutcome };
