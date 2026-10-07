/* @layer site-kit @kind logic */
/** The words under a tray row's bar: how far it is, how long is left, and what to do next. */
import { formatBytes } from '../../../lib/format-bytes';
import { formatTimeLeft, formatTransfer } from '../../../upload/upload-format';
import type { UploadJob } from '../../../upload/upload-job.type';

type RowLines = {
  /** "147 of 312 MB · 6.8 MB/s"; null for a job with no file. */
  transfer: string | null;
  timeLeft: string | null;
  /** Why the row stopped, or what it waits for. */
  note: string | null;
};

const percentOf = (job: UploadJob) => Math.round(Math.max(0, Math.min(1, job.bytes ? job.sent / job.bytes : 0)) * 100);

const noteOf = (job: UploadJob): string | null => {
  if (job.phase === 'needs-file') return job.error ?? `The page was reloaded. Pick ${job.fileName ?? 'the file'} again.`;
  return job.error;
};

const rowLines = (job: UploadJob): RowLines => {
  const { phase, bytes, sent, bytesPerSecond, msLeft } = job;
  const note = noteOf(job);
  if (bytes === 0) return { transfer: null, timeLeft: null, note };
  if (phase === 'done') return { transfer: formatBytes(bytes), timeLeft: null, note };
  const moving = phase === 'uploading';
  return {
    transfer: formatTransfer(sent, bytes, moving ? bytesPerSecond : null),
    timeLeft: moving && msLeft !== null ? formatTimeLeft(msLeft) : null,
    note,
  };
};

export { rowLines, percentOf };
export type { RowLines };
