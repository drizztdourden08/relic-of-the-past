/* @layer site-kit @kind logic */
/**
 * The step list of a job: the ids of the file's own steps, the generic labels a site may
 * keep or replace, and the pure changes the queue makes to the list as a job moves.
 */
import type { StepState, UploadStep } from './upload-job.type';

/** The steps the queue itself moves: hashing, the part PUTs, and complete. */
const FILE_STEP = { hash: 'hash', upload: 'upload', verify: 'verify' } as const;

type FileStepLabels = Record<keyof typeof FILE_STEP, string>;

const GENERIC_LABELS: FileStepLabels = {
  hash: 'Checking the file',
  upload: 'Uploading',
  verify: 'Checked',
};

const stepOf = (id: string, label: string): UploadStep => ({ id, label, state: 'pending', detail: null });

const fileSteps = (labels: FileStepLabels = GENERIC_LABELS): UploadStep[] => [
  stepOf(FILE_STEP.hash, labels.hash),
  stepOf(FILE_STEP.upload, labels.upload),
  stepOf(FILE_STEP.verify, labels.verify),
];

const setStep = (steps: readonly UploadStep[], id: string, state: StepState, detail?: string | null): UploadStep[] =>
  steps.map((step) => (step.id === id ? { ...step, state, detail: detail === undefined ? step.detail : detail } : step));

const relabelStep = (steps: readonly UploadStep[], id: string, label: string): UploadStep[] =>
  steps.map((step) => (step.id === id ? { ...step, label } : step));

/** A finished job: every step still open is done. */
const settleSteps = (steps: readonly UploadStep[]): UploadStep[] =>
  steps.map((step) => (step.state === 'done' ? step : { ...step, state: 'done' }));

/** A failed job: the running step is the one that failed. */
const failSteps = (steps: readonly UploadStep[]): UploadStep[] =>
  steps.map((step) => (step.state === 'running' ? { ...step, state: 'failed' } : step));

/** A restored job: whatever was running when the page went away runs again. */
const restoreSteps = (steps: readonly UploadStep[]): UploadStep[] =>
  steps.map((step) => (step.state === 'running' || step.state === 'failed' ? { ...step, state: 'pending' } : step));

const lastStepId = (steps: readonly UploadStep[]): string | null => steps[steps.length - 1]?.id ?? null;

export { FILE_STEP, GENERIC_LABELS, stepOf, fileSteps, setStep, relabelStep, settleSteps, failSteps, restoreSteps, lastStepId };
export type { FileStepLabels };
