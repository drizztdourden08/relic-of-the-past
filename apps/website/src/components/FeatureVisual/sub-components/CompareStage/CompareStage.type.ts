/* @layer website-site @kind types */
import type { Screenshot } from '../../../../features';

type CompareStageProps = {
  before: Screenshot;
  after: Screenshot;
  labels: readonly [string, string];
  axis: 'x' | 'y';
};

type SweepState = { pos: number; dir: 1 | -1 };

export type { CompareStageProps, SweepState };
