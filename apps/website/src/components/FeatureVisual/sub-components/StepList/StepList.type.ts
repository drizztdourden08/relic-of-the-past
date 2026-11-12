/* @layer website-site @kind types */
import type { VideoStep } from '../../../../features';

type StepListProps = {
  steps: readonly VideoStep[];
  current: number;
  onSelect: (seconds: number) => void;
};

export type { StepListProps };
