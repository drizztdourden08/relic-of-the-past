/* @layer sanctuary-site @kind types */
import type { FileType } from '@shared/sanctuary/file-types';

type BatchEditFormProps = {
  types: readonly FileType[];
  knownTags: readonly string[];
  busy: boolean;
  onSetType: (type: FileType) => void;
  onAddTags: (tags: readonly string[]) => void;
  onRemoveTags: (tags: readonly string[]) => void;
};

export type { BatchEditFormProps };
