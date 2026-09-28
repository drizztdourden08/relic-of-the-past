/* @layer site-kit @kind types */
import type { UploadJob } from '../../upload/upload-job.type';

type UploadRowProps = {
  job: UploadJob;
  /** Opens the job's dialog; the whole row is the target. */
  onOpen: (id: string) => void;
  onCancel: (id: string) => void;
  onDismiss: (id: string) => void;
  /** The file for a job a reload left without its copy. */
  onPickFile: (id: string, file: File) => void;
};

export type { UploadRowProps };
