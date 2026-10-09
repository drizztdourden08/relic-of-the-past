/* @layer site-kit @kind constants */
import type { FileStepLabels } from './upload-steps.type';

const FILE_STEP = { hash: 'hash', upload: 'upload', verify: 'verify' } as const;

const GENERIC_LABELS: FileStepLabels = {
  hash: 'Checking the file',
  upload: 'Uploading',
  verify: 'Checked',
};

export { FILE_STEP, GENERIC_LABELS };
