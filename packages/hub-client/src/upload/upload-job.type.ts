/* @layer site-kit @kind types */
type UploadPhase = 'queued' | 'hashing' | 'uploading' | 'verifying' | 'done' | 'failed' | 'needs-file';

type StepState = 'pending' | 'running' | 'done' | 'failed';

type UploadStep = {
  id: string;
  label: string;
  state: StepState;
  detail: string | null;
};

type UploadResume = {
  recordId: string;
  n: number | null;
  partSize: number;
  parts: number;
};

type FollowUpState = 'idle' | 'running' | 'done';

type UploadJob = {
  id: string;
  label: string;
  title: string;
  fileName: string | null;
  bytes: number;
  sent: number;
  phase: UploadPhase;
  bytesPerSecond: number | null;
  msLeft: number | null;
  error: string | null;
  steps: UploadStep[];
  resume: UploadResume | null;
  fileKept: boolean;
  followUp: FollowUpState | null;
  createdAt: number;
};

export type { UploadPhase, StepState, UploadStep, UploadResume, UploadJob };
