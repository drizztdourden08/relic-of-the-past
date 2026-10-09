/* @layer sanctuary-site @kind types */
import type { FileType } from '@rotp/hub-contracts';
import type { UploadMeta } from '../../upload/upload-target.type';

type UploadDialogProps = {
  files: File[];
  types: readonly FileType[];
  defaultType: FileType;
  knownTags: readonly string[];
  onConfirm: (meta: UploadMeta) => void;
  onCancel: () => void;
};

export type { UploadDialogProps };
