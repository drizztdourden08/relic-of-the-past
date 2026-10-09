/* @layer sanctuary-site @kind types */
import type { FileType, SanctuaryFile } from '@rotp/hub-contracts';
import type { PatchFileBody } from '@rotp/hub-contracts';

type FileEditFormProps = {
  file: SanctuaryFile;
  knownTags: readonly string[];
  types: readonly FileType[];
  busy: boolean;
  onSave: (patch: PatchFileBody) => void;
  onCancel: () => void;
};

export type { FileEditFormProps };
