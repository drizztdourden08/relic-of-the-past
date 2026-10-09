/* @layer shared @kind data */
import type { FeatureDef } from '../feature.type';

const BUG_FIXES_FEATURES: FeatureDef[] = [
  {
    id: 'miscBugFixes',
    label: 'Misc bug fixes',
    description:
      'Legacy bundle of miscellaneous bug fixes. The individual fixes have moved to features1/2 split gates; this entry is kept for backward compatibility.',
    userMessage:
      'Enables a bundle of miscellaneous bug fixes. This is now split into individual toggles; this entry is kept for backward compatibility.',
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
    label: 'Gameplay-altering bug fixes',
    description:
      'Legacy bundle of bug fixes that change gameplay behavior. The individual fixes have moved to features1/2 split gates, so this entry only exists for backward compatibility.',
    userMessage:
      'Enables a bundle of bug fixes that change how the game plays. It is now split into individual toggles and kept only for backward compatibility.',
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
