/* @layer site-kit @kind types */
import type { QueueState } from './queue-state.type';
import type { FileFacts, UploadRecord } from './upload-record.type';
import type { PrepareContext, UploadRunner } from './upload-runner.type';

type ResolveResumeParams<T, R> = {
  runner: UploadRunner<T, R>;
  record: UploadRecord<T>;
  state: QueueState;
  file: Blob;
  facts: FileFacts;
  signal: AbortSignal;
  step: PrepareContext<T, R>['step'];
  save: () => Promise<void>;
};

export type { ResolveResumeParams };
