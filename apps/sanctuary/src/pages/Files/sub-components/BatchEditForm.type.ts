/* @layer sanctuary-site @kind types */
import type { FileType } from '@rotp/hub-contracts';

type BatchEditFormProps = {
  types: readonly FileType[];
  knownTags: readonly string[];
  busy: boolean;
  onSetType: (type: FileType) => void;
  onAddTags: (tags: readonly string[]) => void;
  onRemoveTags: (tags: readonly string[]) => void;
};

export type { BatchEditFormProps };
