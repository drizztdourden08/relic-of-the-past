/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { FileActions } from '../behavior/useFileActions.type';

type FileDetailButtonsProps = {
  file: SanctuaryFile;
  actions: FileActions;
  canDelete: boolean;
  canEdit: boolean;
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export type { FileDetailButtonsProps };
