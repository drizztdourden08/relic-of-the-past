/* @layer shared-game @kind constants */
import type { OptionDescription } from '../option-description.type';

const PROGRESSIVE_TIER_ROW = {
  group: 'items' as const,
  kind: 'toggle' as const,
  implementation: 'active' as const,
  sourceDefault: true,
  baseline: true,
  locked: false,
  synthetic: true,
};

const TIER_DESCRIPTION: OptionDescription =
  'Unticked, this rung leaves the ladder and the rungs above it move down one.';

const ACTIVATED_FLUTE_DESCRIPTION: OptionDescription =
  'Ticked, the Activated Flute is in the item pool as a second Progressive Ocarina. '
  + 'Unticked, the Flute is woken at the weathervane.';

export { ACTIVATED_FLUTE_DESCRIPTION, PROGRESSIVE_TIER_ROW, TIER_DESCRIPTION };
