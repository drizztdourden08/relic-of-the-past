/* @layer sanctuary-site @kind types */
import type { VersionRequest } from '../behavior/drop-queue';

type VersionUploadDialogProps = {
  request: VersionRequest | null;
  onConfirm: (note: string) => void;
  onCancel: () => void;
};

export type { VersionUploadDialogProps };
