/* @layer site-kit @kind logic */
/** A new job's record, and the tray row of a record: a new job, or one a reload brought back. */
import type { UploadJob, UploadPhase } from './upload-job.type';
import type { FileFacts, UploadRecord } from './upload-record.type';
import type { UploadRunner } from './upload-runner.type';

const factsOf = (file: File): FileFacts => ({ name: file.name, size: file.size, lastModified: file.lastModified, type: file.type });

/** A picked file is the one a record names when its name, size and date all match. */
const isSameFile = (facts: FileFacts, file: File) =>
  facts.name === file.name && facts.size === file.size && facts.lastModified === file.lastModified;

const recordOf = <T, R>(runner: UploadRunner<T, R>, target: T, file: File | null): UploadRecord<T> => {
  const facts = file ? factsOf(file) : null;
  return {
    id: crypto.randomUUID(),
    site: runner.site,
    label: runner.labelOf(target, facts, null),
    title: runner.titleOf(target, facts),
    target,
    file: facts,
    resume: null,
    steps: runner.stepsOf(target, facts),
    createdAt: Date.now(),
  };
};

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

export { factsOf, isSameFile, recordOf, jobOf };
