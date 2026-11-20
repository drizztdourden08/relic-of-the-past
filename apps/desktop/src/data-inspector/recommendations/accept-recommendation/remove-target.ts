/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { optionText } from '@rotp/randomizer';
import { recordDeleterFor } from '@app/views/DataInspector/behavior/delete-record';
import { WRITE_FAILED } from '../recommendations.constants';
import type { AcceptOutcome } from '../recommendations.type';
import { noPathMessage } from './no-path-message';
import { refused } from './refused';

const removeTarget = async (kind: EntityKind, id: string): Promise<AcceptOutcome> => {
  const deleter = recordDeleterFor(kind);
  if (!deleter) return refused(noPathMessage(kind, 'delete'));
  const result = await deleter(id);
  return result.success ? { success: true, id } : refused(result.error ?? optionText(WRITE_FAILED));
};

export { removeTarget };
