/* @layer site-kit @kind logic */
import type { UploadJob, UploadPhase } from '../upload-job.type';
import type { UploadRecord } from '../upload-record.type';

const jobOf = <T>(record: UploadRecord<T>, phase: UploadPhase, fileKept = false): UploadJob => ({
  id: record.id,
  label: record.label,
  title: record.title,
  fileName: record.file?.name ?? null,
  bytes: record.file?.size ?? 0,
  sent: 0,
  phase,
  bytesPerSecond: null,
  msLeft: null,
  error: null,
  steps: record.steps,
  resume: record.resume,
  fileKept,
  followUp: null,
  createdAt: record.createdAt,
});

export { jobOf };
