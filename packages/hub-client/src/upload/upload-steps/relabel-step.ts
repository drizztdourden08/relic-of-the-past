/* @layer site-kit @kind logic */
import type { UploadStep } from '../upload-job.type';

const relabelStep = (steps: readonly UploadStep[], id: string, label: string): UploadStep[] =>
  steps.map((step) => (step.id === id ? { ...step, label } : step));

export { relabelStep };
