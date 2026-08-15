/* @layer renderer-app @kind logic */
/**
 * Accepting a finding: the one place a recommendation turns into a real dataset
 * write.
 *
 * Nothing new writes here. The three actions map onto the three CRUD verbs the
 * screen already has for every collection — `RECORD_CREATORS`, `RECORD_WRITERS`
 * and `recordDeleterFor` — so a finding is applied by exactly the same code
 * path as the same edit made by hand, through the same channel, into the same
 * file. That is deliberate: a second write path would be a second thing to keep
 * in step with the emitters.
 *
 * A `create` is checked against `validate-create.ts` first, because a detector
 * can only propose what the live game exposes and some collections need more
 * than that to have a home on disk at all.
 *
 * The outcome is a union rather than a boolean plus optional fields: a refusal
 * that a person can resolve (`needs-form`) and one that nothing can
 * (`failed`) lead to different handling in both callers, and the union makes
 * forgetting one of them a compile error.
 *
 * The order of the tail matters. `markWritten` stamps the review layer only
 * after the dataset write has actually landed, and the verdict is recorded only
 * after that — a failed write leaves the finding open, which is the honest
 * state for something nobody managed to apply.
 */
import { RECORD_CREATORS } from '../record-creators';
import { RECORD_WRITERS } from '../record-writers';
import { recordDeleterFor } from '../delete-record';
import { markWritten } from '../review-store';
import { decideRecommendation } from './recommendation-cache';
import { createBlockers } from './validate-create';
import type { EntityKind } from '@shared/game/data';
import type { Recommendation } from '@shared/game/recommendations';
import type { InspectorRow } from '../../DataInspector.type';

/** The record the write landed on — allocated for a create, the target otherwise. */
interface AcceptWritten {
  success: true;
  id: string;
}

interface AcceptRefused {
  success: false;
  /**
   * `needs-form` means nothing was attempted because the proposal is
   * incomplete or already covered — a person decides what happens next, and a
   * batch run counts it as skipped. `failed` means the write itself was
   * refused.
   */
  reason: 'needs-form' | 'failed';
  error: string;
}

type AcceptOutcome = AcceptWritten | AcceptRefused;

const NO_PATH = (kind: EntityKind, action: string): string =>
  `No ${action} path is wired for the ${kind} collection.`;
const NO_TARGET = 'This finding names no record to change.';
const FAILED = 'The write failed.';
const NEEDS_FORM = (blockers: readonly string[]): string =>
  `This proposal still needs ${blockers.join(', ')} — fill those in, then accept.`;

const refused = (error: string): AcceptRefused => ({ success: false, reason: 'failed', error });

const threw = (error: unknown): AcceptRefused =>
  refused(error instanceof Error ? error.message : FAILED);

const create = async (kind: EntityKind, proposed: InspectorRow): Promise<AcceptOutcome> => {
  const creator = RECORD_CREATORS[kind];
  if (!creator) return refused(NO_PATH(kind, 'create'));
  const blockers = createBlockers(kind, proposed);
  if (blockers.length > 0) return { success: false, reason: 'needs-form', error: NEEDS_FORM(blockers) };
  const result = await creator(proposed);
  // A creator can decline for a reason a person has to settle (a record
  // already covers this identity); that is not a failed write.
  if (!result.success) {
    return { success: false, reason: result.needsReview ? 'needs-form' : 'failed', error: result.error };
  }
  return { success: true, id: result.id };
};

/**
 * The proposal carries whatever id the detector put on it, which for an update
 * is the record's own — but `targetId` is the identity the store reconciles on,
 * so that is what the write is keyed by rather than trusting the payload.
 */
const update = async (kind: EntityKind, id: string, proposed: InspectorRow): Promise<AcceptOutcome> => {
  const writer = RECORD_WRITERS[kind];
  if (!writer) return refused(NO_PATH(kind, 'write'));
  await writer({ ...proposed, id });
  return { success: true, id };
};

const remove = async (kind: EntityKind, id: string): Promise<AcceptOutcome> => {
  const deleter = recordDeleterFor(kind);
  if (!deleter) return refused(NO_PATH(kind, 'delete'));
  const result = await deleter(id);
  return result.success ? { success: true, id } : refused(result.error ?? FAILED);
};

const applyTo = (
  entry: Recommendation,
  proposed: InspectorRow,
): Promise<AcceptOutcome> => {
  const kind = entry.kind;
  if (entry.action === 'create') return create(kind, proposed);
  if (!entry.targetId) return Promise.resolve(refused(NO_TARGET));
  if (entry.action === 'delete') return remove(kind, entry.targetId);
  return update(kind, entry.targetId, proposed);
};

/**
 * Applies one finding and closes it out. `proposed` is passed in rather than
 * read off the entry so the pane's edited draft — the reviewer's amendment to
 * what the detector suggested — is what gets written.
 */
const acceptRecommendation = async (
  entry: Recommendation,
  proposed: InspectorRow,
): Promise<AcceptOutcome> => {
  let outcome: AcceptOutcome;
  try {
    outcome = await applyTo(entry, proposed);
  } catch (error: unknown) {
    outcome = threw(error);
  }
  if (!outcome.success) return outcome;

  markWritten(entry.kind, outcome.id);
  await decideRecommendation(entry.kind, entry.id, 'accepted');
  return outcome;
};

/** A verdict with no dataset write behind it. */
const dismissRecommendation = (entry: Recommendation): Promise<void> =>
  decideRecommendation(entry.kind, entry.id, 'dismissed');

export { acceptRecommendation, dismissRecommendation };
export type { AcceptOutcome, AcceptRefused, AcceptWritten };
