/* @layer site-kit @kind types */
import type { ReactNode } from 'react';
import type { UploadStep } from '../../../upload/upload-job.type';

type StepRowProps = {
  step: UploadStep;
  children?: ReactNode;
};

export type { StepRowProps };
