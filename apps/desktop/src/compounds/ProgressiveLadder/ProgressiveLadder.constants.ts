/* @layer renderer-components @kind constants */
import { PROGRESSIVE_MODES, PROGRESSIVE_MODE_LABELS } from '@rotp/randomizer';
import type { ProgressiveFamilyMode } from '@rotp/randomizer';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';

const MODE_OPTIONS: SegmentOption<ProgressiveFamilyMode>[] = PROGRESSIVE_MODES.map((mode) => ({
  value: mode,
  label: PROGRESSIVE_MODE_LABELS[mode],
}));

const IN_SEED = 'in the seed';

const OUT_OF_SEED = 'out of the seed';

export { IN_SEED, MODE_OPTIONS, OUT_OF_SEED };
