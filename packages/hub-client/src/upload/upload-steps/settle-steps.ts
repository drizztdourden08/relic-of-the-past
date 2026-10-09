/* @layer site-kit @kind logic */
import type { UploadStep } from '../upload-job.type';

const settleSteps = (steps: readonly UploadStep[]): UploadStep[] =>
  steps.map((step) => (step.state === 'done' ? step : { ...step, state: 'done' }));

export { settleSteps };
