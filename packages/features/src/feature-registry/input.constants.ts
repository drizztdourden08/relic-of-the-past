/* @layer shared @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { FeatureDef } from '../feature.type';

const INPUT_FEATURES: FeatureDef[] = [
  {
    id: 'hostMenu',
    label: msg('features:feature.hostMenu.label'),
    description:
      'Hands the pause menu to the host: the core stops drawing and running its own menu, and the 24-slot item table is used instead of the 20-slot one.',
    userMessage: msg('features:feature.hostMenu.message'),
    group: 'HUD',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures2_HostMenu',
    word: 2,
    bit: 134217728,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'modernControls',
    label: msg('features:feature.modernControls.label'),
    description:
      'Lets the host write the equipped-item register every frame, so any button can fire any item instead of only Y.',
    userMessage: msg('features:feature.modernControls.message'),
    group: 'Input',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures2_ModernControls',
    word: 2,
    bit: 268435456,
    default: false,
    requires: ['hostMenu'],
    affectsVanillaParity: true,
    live: true,
  },
  {
    id: 'haptics',
    label: msg('features:feature.haptics.label'),
    description: 'Emits rumble/haptic events to the host on game events (damage, pickups, etc.).',
    userMessage: msg('features:feature.haptics.message'),
    group: 'Input',
    kind: 'host-event',
    origin: 'relic',
    flag: 'kFeatures0_Haptics',
    bit: 1048576,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
];

export { INPUT_FEATURES };
