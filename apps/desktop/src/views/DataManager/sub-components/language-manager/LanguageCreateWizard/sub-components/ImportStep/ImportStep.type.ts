/* @layer renderer-components @kind types */
import type { StepBodyProps } from '../StepBody/StepBody.type';

type ImportStepProps = Pick<StepBodyProps, 'wizard' | 'sets' | 'progress' | 'patched'>;

export type { ImportStepProps };
