/* @layer renderer-components @kind constants */
import { PROGRESSIVE_MODES, PROGRESSIVE_MODE_LABELS } from '@rotp/randomizer';
import type { ProgressiveFamilyMode } from '@rotp/randomizer';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';

const TIERS_TITLE = 'Tiered items';

const TIERS_CAPTION = 'Click a rung to take it out of the seed.';

const BLOCKED_LEAD = 'This set cannot be rolled:';

const MODE_OPTIONS: SegmentOption[] = PROGRESSIVE_MODES.map((mode) => ({
  value: mode,
  label: PROGRESSIVE_MODE_LABELS[mode],
}));

const ORDERED_MODE: ProgressiveFamilyMode = 'progressive';

export { BLOCKED_LEAD, MODE_OPTIONS, ORDERED_MODE, TIERS_CAPTION, TIERS_TITLE };
