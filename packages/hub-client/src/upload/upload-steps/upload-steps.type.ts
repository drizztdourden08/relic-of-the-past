/* @layer site-kit @kind types */
import type { FILE_STEP } from './upload-steps.constants';

type FileStepLabels = Record<keyof typeof FILE_STEP, string>;

export type { FileStepLabels };
