/* @layer sanctuary-site @kind types */
import type { FileType, SanctuaryFile, PatchFileBody } from '@rotp/hub-contracts';

type FileEditFormProps = {
  file: SanctuaryFile;
  knownTags: readonly string[];
  types: readonly FileType[];
  busy: boolean;
  onSave: (patch: PatchFileBody) => void;
  onCancel: () => void;
};

export type { FileEditFormProps };
