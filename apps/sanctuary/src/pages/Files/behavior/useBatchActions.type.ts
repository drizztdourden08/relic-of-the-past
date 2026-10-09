/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { useBatchActions } from './useBatchActions';

type UseBatchActionsParams = {
  canEdit: (file: SanctuaryFile) => boolean;
  onPatched: (file: SanctuaryFile) => void;
  onDeleted: (id: string) => void;
};

type FileWrite = (file: SanctuaryFile) => Promise<'changed' | 'same'>;

type BatchActions = ReturnType<typeof useBatchActions>;

export type { BatchActions, FileWrite, UseBatchActionsParams };
