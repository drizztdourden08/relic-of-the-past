/* @layer website-site @kind types */
import type { CollageSlot } from '../../../../features';

type Flip = 0 | 1;

type CollageArrangement = {
  slots: readonly CollageSlot[];
  flips: readonly (Flip | undefined)[];
};

export type { CollageArrangement, Flip };
