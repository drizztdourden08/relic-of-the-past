/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { OptionDescriptionSource } from '../option-description.type';

const PROGRESSIVE_TIER_ROW = {
  group: 'items' as const,
  kind: 'toggle' as const,
  implementation: 'active' as const,
  sourceDefault: true,
  baseline: true,
  locked: false,
  synthetic: true,
};

const TIER_DESCRIPTION: OptionDescriptionSource = msg('randomizer-world:desc.tier');

const ACTIVATED_FLUTE_DESCRIPTION: OptionDescriptionSource = msg('randomizer-world:desc.activatedFlute');

export { ACTIVATED_FLUTE_DESCRIPTION, PROGRESSIVE_TIER_ROW, TIER_DESCRIPTION };
