/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { useFileActions } from './useFileActions';

type UseFileActionsParams = {
  onPatched: (file: SanctuaryFile) => void;
  onDeleted: (id: string) => void;
};

type FileActions = ReturnType<typeof useFileActions>;

export type { FileActions, UseFileActionsParams };
