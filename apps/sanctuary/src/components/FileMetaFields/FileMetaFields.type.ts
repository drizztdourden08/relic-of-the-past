/* @layer sanctuary-site @kind types */
import type { FileType } from '@rotp/hub-contracts';

type FileTypeOption = { value: FileType; label: string };

type FileMetaFieldsProps = {
  variant: 'upload' | 'edit';
  type: FileType;
  typeOptions: FileTypeOption[];
  tags: readonly string[];
  knownTags: readonly string[];
  version: string;
  note: string;
  onTypeChange: (type: FileType) => void;
  onTagsChange: (tags: readonly string[]) => void;
  onVersionChange: (version: string) => void;
  onNoteChange: (note: string) => void;
};

export type { FileMetaFieldsProps };
