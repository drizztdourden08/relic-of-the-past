/* @layer renderer-app @kind logic */
/**
 * The reviewer's amendment to a proposal, as plain state. A draft carries the
 * id it belongs to, so selecting another finding drops it with no effect to
 * clear it, and Revert is a single assignment. Nothing here writes to the
 * store: the recorded proposal stays as is until an accept succeeds, so
 * re-running detection reconciles onto the same entry.
 */
import type { Recommendation } from '@shared/game/recommendations';
import type { InspectorRow } from '../../DataInspector.type';

interface ProposalDraft {
  /** Which finding the amendment belongs to; null when there is none. */
  forId: string | null;
  record: InspectorRow | null;
}

const NO_DRAFT: ProposalDraft = { forId: null, record: null };

const matches = (draft: ProposalDraft, entry: Recommendation | null): boolean =>
  entry !== null && draft.forId === entry.id && draft.record !== null;

/** The amendment when there is one for this finding, the detector's draft otherwise. */
const proposalOf = (entry: Recommendation | null, draft: ProposalDraft): InspectorRow | null => {
  if (matches(draft, entry)) return draft.record;
  return (entry?.proposed as InspectorRow | undefined) ?? null;
};

const editedDraft = (entry: Recommendation, record: InspectorRow): ProposalDraft =>
  ({ forId: entry.id, record });

/** Discards the amendment. `proposalOf` then reads the detector's own draft again. */
const revertedDraft = (): ProposalDraft => NO_DRAFT;

const isAmended = (entry: Recommendation | null, draft: ProposalDraft): boolean =>
  matches(draft, entry);

export { NO_DRAFT, editedDraft, isAmended, proposalOf, revertedDraft };
export type { ProposalDraft };
