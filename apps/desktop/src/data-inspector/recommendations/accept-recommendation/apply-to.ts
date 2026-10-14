/* @layer renderer-app @kind logic */
import type { Recommendation } from '@rotp/navigation';
import type { InspectorRow } from '@app/views/DataInspector/DataInspector.type';
import { FINDING_NO_TARGET } from '../recommendations.constants';
import type { AcceptOutcome } from '../recommendations.type';
import { createProposed } from './create-proposed';
import { refused } from './refused';
import { removeTarget } from './remove-target';
import { updateTarget } from './update-target';

const applyTo = (
  entry: Recommendation,
  proposed: InspectorRow,
): Promise<AcceptOutcome> => {
  const kind = entry.kind;
  if (entry.action === 'create') return createProposed(kind, proposed);
  if (!entry.targetId) return Promise.resolve(refused(FINDING_NO_TARGET));
  if (entry.action === 'delete') return removeTarget(kind, entry.targetId);
  return updateTarget(kind, entry.targetId, proposed);
};

export { applyTo };
