/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import type { InspectorRow } from '../../../DataInspector.type';
import type { ProposalDraft } from '../recommendations.type';

const editedDraft = (entry: Recommendation, record: InspectorRow): ProposalDraft =>
  ({ forId: entry.id, record });

export { editedDraft };
