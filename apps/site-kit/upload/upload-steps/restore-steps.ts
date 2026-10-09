/* @layer site-kit @kind logic */
import type { UploadStep } from '../upload-job.type';

const restoreSteps = (steps: readonly UploadStep[]): UploadStep[] =>
  steps.map((step) => (step.state === 'running' || step.state === 'failed' ? { ...step, state: 'pending' } : step));

export { restoreSteps };
