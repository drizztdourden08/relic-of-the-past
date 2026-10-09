/* @layer site-kit @kind logic */
import type { UploadStep } from '../upload-job.type';
import { FILE_STEP, GENERIC_LABELS } from './upload-steps.constants';
import type { FileStepLabels } from './upload-steps.type';
import { stepOf } from './step-of';

const fileSteps = (labels: FileStepLabels = GENERIC_LABELS): UploadStep[] => [
  stepOf(FILE_STEP.hash, labels.hash),
  stepOf(FILE_STEP.upload, labels.upload),
  stepOf(FILE_STEP.verify, labels.verify),
];

export { fileSteps };
