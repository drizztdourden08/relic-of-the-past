/* @layer renderer-app @kind logic */
import type { Recommendation } from '@rotp/navigation';
import type { ProposalDraft } from '../recommendations.type';

const matchesDraft = (draft: ProposalDraft, entry: Recommendation | null): boolean =>
  entry !== null && draft.forId === entry.id && draft.record !== null;

export { matchesDraft };
