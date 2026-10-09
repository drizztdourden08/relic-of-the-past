/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import type { ProposalDraft } from '../recommendations.type';
import { matchesDraft } from './matches-draft';

const isAmended = (entry: Recommendation | null, draft: ProposalDraft): boolean =>
  matchesDraft(draft, entry);

export { isAmended };
