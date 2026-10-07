/* @layer site-kit @kind types */
/**
 * One upload job as the tray and the dialog read it. A job is one file on its way to the
 * bucket, sometimes with the site's own steps before it (a store listing and its pictures),
 * or those steps alone. `resume` is set once the server opened the multipart record: it is
 * what a reload needs to continue.
 */
type UploadPhase = 'queued' | 'hashing' | 'uploading' | 'verifying' | 'done' | 'failed' | 'needs-file';

type StepState = 'pending' | 'running' | 'done' | 'failed';

/** One line of the dialog's step list. */
type UploadStep = {
  id: string;
  label: string;
  state: StepState;
  /** A short fact under or beside the label: "draft", "sha-256 · 312 MB", "147 of 312 MB". */
  detail: string | null;
};

/** The server's multipart record: whose it is, its version number and its part layout. */
type UploadResume = {
  recordId: string;
  /** The version the server numbered; null for a new file. */
  n: number | null;
  partSize: number;
  parts: number;
};

/** The site's action once a job is done (the store's "Send for review"); null when it has none. */
type FollowUpState = 'idle' | 'running' | 'done';

type UploadJob = {
  id: string;
  /** What the tray row says: the file name, or "Name, v4" for a version. */
  label: string;
  /** The dialog's title. */
  title: string;
  /** The picked file's own name; null for a job with no file. */
  fileName: string | null;
  bytes: number;
  /** Bytes in the bucket so far, parts already up after a reload included. */
  sent: number;
  phase: UploadPhase;
  bytesPerSecond: number | null;
  msLeft: number | null;
  error: string | null;
  steps: UploadStep[];
  resume: UploadResume | null;
  /** The browser holds its own copy of the file, so a reload continues by itself. */
  fileKept: boolean;
  followUp: FollowUpState | null;
  createdAt: number;
};

export type { UploadPhase, StepState, UploadStep, UploadResume, FollowUpState, UploadJob };
