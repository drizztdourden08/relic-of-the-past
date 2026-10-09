/* @layer site-kit @kind logic */
import { formatBytes, formatTimeLeft, formatTransfer } from '@rotp/hub-client';
import type { UploadJob } from '@rotp/hub-client';
import type { RowLines } from './row-lines.type';

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

export { rowLines };
