/* @layer site-kit @kind types */
import type { UploadJob } from '../../upload/upload-job.type';

type UploadRowProps = {
  job: UploadJob;
  onOpen: (id: string) => void;
  onCancel: (id: string) => void;
  onDismiss: (id: string) => void;
  onPickFile: (id: string, file: File) => void;
};

export type { UploadRowProps };
