/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { InspectorRow } from '@app/views/DataInspector/DataInspector.type';
import { RECORD_CREATORS } from '@app/data-inspector/record-creators';
import type { AcceptOutcome } from '../recommendations.type';
import { createBlockers } from '../validate-create';
import { needsFormMessage } from './needs-form-message';
import { noPathMessage } from './no-path-message';
import { refused } from './refused';

const createProposed = async (kind: EntityKind, proposed: InspectorRow): Promise<AcceptOutcome> => {
  const creator = RECORD_CREATORS[kind];
  if (!creator) return refused(noPathMessage(kind, 'create'));
  const blockers = createBlockers(kind, proposed);
  if (blockers.length > 0) return { success: false, reason: 'needs-form', error: needsFormMessage(blockers) };
  const result = await creator(proposed);
  if (!result.success) {
    return { success: false, reason: result.needsReview ? 'needs-form' : 'failed', error: result.error };
  }
  return { success: true, id: result.id };
};

export { createProposed };
