/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { bumpDataRevision } from '@app/lib/game/data-revision';
import type { RecordDeleter } from '../DataInspector.type';
import { DELETERS } from './delete-record.constants';

const recordDeleterFor = (collectionKind: string): RecordDeleter | undefined => {
  const deleter = DELETERS[collectionKind as EntityKind];
  if (!deleter) return undefined;
  return async (id: string) => {
    const result = await deleter(id);
    if (result.success) bumpDataRevision();
    return result;
  };
};

export { recordDeleterFor };
