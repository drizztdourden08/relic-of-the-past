/* @layer renderer-components @kind types */
import type { StepBodyProps } from '../StepBody/StepBody.type';

type ReviewStepProps = Pick<StepBodyProps, 'wizard' | 'sets' | 'progress'>;

export type { ReviewStepProps };
