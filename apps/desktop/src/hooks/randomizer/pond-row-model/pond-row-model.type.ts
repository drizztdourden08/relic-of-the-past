/* @layer renderer-hooks @kind types */
import type { PondSetting } from '@rotp/randomizer';

type PondLadderFields = Pick<Extract<PondSetting, { mode: 'custom' }>, 'start' | 'max' | 'throws' | 'shape'>;

export type { PondLadderFields };
