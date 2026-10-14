/* @layer renderer-app @kind logic */
import type { Recommendation } from '@rotp/navigation';
import type { InspectorRow } from '@app/views/DataInspector/DataInspector.type';
import type { ProposalDraft } from '../recommendations.type';

const editedDraft = (entry: Recommendation, record: InspectorRow): ProposalDraft =>
  ({ forId: entry.id, record });

export { editedDraft };
