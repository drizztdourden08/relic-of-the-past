/* @layer website-site @kind types */
import type { ClipPair, Screenshot } from '../../../../features';

type CompareStageProps = {
  before: Screenshot;
  after: Screenshot;
  labels: readonly [string, string];
  axis: 'x' | 'y';
  clips?: ClipPair;
};

type SweepState = { progress: number; dir: 1 | -1; hold: number };

export type { CompareStageProps, SweepState };
