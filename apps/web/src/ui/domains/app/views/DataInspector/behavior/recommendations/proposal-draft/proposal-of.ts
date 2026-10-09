/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import type { InspectorRow } from '../../../DataInspector.type';
import type { ProposalDraft } from '../recommendations.type';
import { matchesDraft } from './matches-draft';

const proposalOf = (entry: Recommendation | null, draft: ProposalDraft): InspectorRow | null => {
  if (matchesDraft(draft, entry)) return draft.record;
  return (entry?.proposed as InspectorRow | undefined) ?? null;
};

export { proposalOf };
