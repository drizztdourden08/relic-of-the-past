/* @layer site-kit @kind types */
import type { BegunMultipart } from '@shared/hub/upload/run-multipart';
import type { StepState, UploadResume, UploadStep } from './upload-job.type';
import type { FileFacts } from './upload-record.type';

/** What the site's own steps are handed while they run before the file moves. */
type PrepareContext<T, R> = {
  target: T;
  /** Keeps the target's new state, so a reload continues after the step just finished. */
  save: (target: T) => Promise<void>;
  step: (id: string, state: StepState, detail?: string | null) => void;
  /** Hands a record the API answered with to the site's lists. */
  emit: (record: R) => void;
  signal: AbortSignal;
};

/** The site's action on a finished job, such as the store's "Send for review". */
type FollowUp<T, R> = {
  label: string;
  /** The last step's label once the action went through. */
  doneLabel: string;
  run: (target: T, resume: UploadResume) => Promise<R>;
};

/**
 * How a site uploads. The queue, the tray, the dialog and the resume are the same for every
 * site; this says what differs: the size cap, the words, the steps, the site's own work
 * before the file, and the routes that begin a record and are bound to it afterwards.
 * `T` is where a job goes and must survive IndexedDB (plain data and Blobs); `R` is the
 * record the API answers with.
 */
type UploadRunner<T, R> = {
  /** Keys this site's records in the shared browser store. */
  site: string;
  maxBytes: number;
  /** Which of the dropped files a target takes. */
  pick: (files: File[], target: T) => File[];
  labelOf: (target: T, file: FileFacts | null, n: number | null) => string;
  titleOf: (target: T, file: FileFacts | null) => string;
  /** Every step the dialog lists, in order; the file's steps use the ids in FILE_STEP. */
  stepsOf: (target: T, file: FileFacts | null) => UploadStep[];
  /** The site's own steps before the file; answers the target as it stands after them. */
  prepare?: (context: PrepareContext<T, R>) => Promise<T>;
  /** The sha256 the begin call sends; null when the site does without one. */
  hash: (file: Blob) => Promise<string | null>;
  /** Opens the record on the server. */
  begin: (target: T, file: FileFacts, sha256: string | null) => Promise<UploadResume>;
  /** The record's later steps, bound to it; also how a restored job reaches its record. */
  bind: (target: T, resume: UploadResume) => BegunMultipart<R>;
  followUp?: FollowUp<T, R>;
};

export type { PrepareContext, FollowUp, UploadRunner };
