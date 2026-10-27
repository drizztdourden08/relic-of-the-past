/* @layer website-site @kind types */
import type { RatioFrame } from '../../../../features';

type RatiosStageProps = {
  frames: readonly RatioFrame[];
  active: number | null;
};

export type { RatiosStageProps };
