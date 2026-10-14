/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { InspectorRow } from '@app/views/DataInspector/DataInspector.type';
import { RECORD_WRITERS } from '@app/data-inspector/record-writers';
import type { AcceptOutcome } from '../recommendations.type';
import { noPathMessage } from './no-path-message';
import { refused } from './refused';

const updateTarget = async (kind: EntityKind, id: string, proposed: InspectorRow): Promise<AcceptOutcome> => {
  const writer = RECORD_WRITERS[kind];
  if (!writer) return refused(noPathMessage(kind, 'write'));
  await writer({ ...proposed, id });
  return { success: true, id };
};

export { updateTarget };
