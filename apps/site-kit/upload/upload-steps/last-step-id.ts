/* @layer site-kit @kind logic */
import type { UploadStep } from '../upload-job.type';

const lastStepId = (steps: readonly UploadStep[]): string | null => steps[steps.length - 1]?.id ?? null;

export { lastStepId };
