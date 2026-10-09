/* @layer sanctuary-site @kind types */
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';
import type { FileActions } from '../behavior/useFileActions.type';

type FileDetailProps = {
  file: SanctuaryFile;
  knownTags: readonly string[];
  types: readonly FileType[];
  canDelete: boolean;
  canEdit: boolean;
  actions: FileActions;
  onDropVersion: (file: SanctuaryFile, dropped: File) => void;
  onClose: () => void;
};

export type { FileDetailProps };
