/* @layer renderer-components @kind types */
import type { StepBodyProps } from '../../RomCreateWizard.type';

type ImportStepProps = Pick<StepBodyProps, 'wizard' | 'extraction' | 'progress'>;

export type { ImportStepProps };
