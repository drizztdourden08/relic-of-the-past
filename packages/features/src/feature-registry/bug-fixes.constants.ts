/* @layer shared @kind data */
import type { FeatureDef } from '../feature.type';

const BUG_FIXES_FEATURES: FeatureDef[] = [
  {
    id: 'miscBugFixes',
    label: 'Misc bug fixes',
    description:
      'Master switch for the miscellaneous bug fixes. Each fix has its own features1/2 gate, and a per-fix toggle overrides this one.',
    userMessage:
      'Turns on every miscellaneous bug fix at once. Individual toggles override it.',
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
      'Master switch for the bug fixes that change gameplay behavior. Each fix has its own features1/2 gate, and a per-fix toggle overrides this one.',
    userMessage:
      'Turns on every bug fix that changes how the game plays. Individual toggles override it.',
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
