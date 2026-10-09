/* @layer site-kit @kind logic */
import type { StepState, UploadStep } from '../upload-job.type';

const setStep = (steps: readonly UploadStep[], id: string, state: StepState, detail?: string | null): UploadStep[] =>
  steps.map((step) => (step.id === id ? { ...step, state, detail: detail === undefined ? step.detail : detail } : step));

export { setStep };
