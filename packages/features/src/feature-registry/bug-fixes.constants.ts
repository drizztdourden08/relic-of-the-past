/* @layer shared @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { FeatureDef } from '../feature.type';

const BUG_FIXES_FEATURES: FeatureDef[] = [
  {
    id: 'miscBugFixes',
    label: msg('features:feature.miscBugFixes.label'),
    description:
      'Master switch for the miscellaneous bug fixes. Each fix has its own features1/2 gate, and a per-fix toggle overrides this one.',
    userMessage: msg('features:feature.miscBugFixes.message'),
    group: 'Bug fixes',
    kind: 'features0-bit',
    origin: 'snesrev',
    flag: 'kFeatures0_MiscBugFixes',
    bit: 4096,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'gameChangingBugFixes',
    label: msg('features:feature.gameChangingBugFixes.label'),
    description:
      'Master switch for the bug fixes that change gameplay behavior. Each fix has its own features1/2 gate, and a per-fix toggle overrides this one.',
    userMessage: msg('features:feature.gameChangingBugFixes.message'),
    group: 'Bug fixes',
    kind: 'features0-bit',
    origin: 'snesrev',
    flag: 'kFeatures0_GameChangingBugFixes',
    bit: 16384,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
];

export { BUG_FIXES_FEATURES };
