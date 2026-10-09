/* @layer sanctuary-site @kind types */
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';
import type { PatchFileBody } from '@shared/sanctuary/schemas/file-schemas';

type FileEditFormProps = {
  file: SanctuaryFile;
  knownTags: readonly string[];
  types: readonly FileType[];
  busy: boolean;
  onSave: (patch: PatchFileBody) => void;
  onCancel: () => void;
};

export type { FileEditFormProps };
