/* @layer site-kit @kind logic */
import type { UploadStep } from '../upload-job.type';

const failSteps = (steps: readonly UploadStep[]): UploadStep[] =>
  steps.map((step) => (step.state === 'running' ? { ...step, state: 'failed' } : step));

export { failSteps };
