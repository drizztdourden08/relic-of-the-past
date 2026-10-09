/* @layer sanctuary-site @kind types */
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';
import type { BatchActions } from '../behavior/useBatchActions.type';
import type { BatchDownload } from '../behavior/useBatchDownload.type';

type SelectionPanelProps = {
  files: readonly SanctuaryFile[];
  types: readonly FileType[];
  knownTags: readonly string[];
  canEdit: (file: SanctuaryFile) => boolean;
  batch: BatchActions;
  download: BatchDownload;
  onClear: () => void;
};

export type { SelectionPanelProps };
