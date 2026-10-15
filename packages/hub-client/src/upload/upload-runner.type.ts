/* @layer site-kit @kind types */
import type { BegunMultipart } from '@rotp/hub-contracts';
import type { StepState, UploadResume, UploadStep } from './upload-job.type';
import type { FileFacts } from './upload-record.type';

type PrepareContext<T, R> = {
  target: T;
  save: (target: T) => Promise<void>;
  step: (id: string, state: StepState, detail?: string | null) => void;
  emit: (record: R) => void;
  signal: AbortSignal;
};

type FollowUp<T, R> = {
  label: string;
  doneLabel: string;
  run: (target: T, resume: UploadResume) => Promise<R>;
};

type UploadRunner<T, R> = {
  site: string;
  maxBytes: number;
  pick: (files: File[], target: T) => File[];
  labelOf: (target: T, file: FileFacts | null, n: number | null) => string;
  titleOf: (target: T, file: FileFacts | null) => string;
  stepsOf: (target: T, file: FileFacts | null) => UploadStep[];
  prepare?: (context: PrepareContext<T, R>) => Promise<T>;
  hash: (file: Blob) => Promise<string | null>;
  begin: (target: T, file: FileFacts, sha256: string | null) => Promise<UploadResume>;
  bind: (target: T, resume: UploadResume) => BegunMultipart<R>;
  followUp?: FollowUp<T, R>;
};

export type { PrepareContext, UploadRunner };
