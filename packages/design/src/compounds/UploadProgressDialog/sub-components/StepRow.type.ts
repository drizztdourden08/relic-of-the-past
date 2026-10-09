/* @layer site-kit @kind types */
import type { ReactNode } from 'react';
import type { UploadStep } from '@rotp/hub-client';

type StepRowProps = {
  step: UploadStep;
  children?: ReactNode;
};

export type { StepRowProps };
