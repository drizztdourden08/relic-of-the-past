/* @layer shared @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { FeatureDef } from '../feature.type';

const AUDIO_FEATURES: FeatureDef[] = [
  {
    id: 'perGroupVolume',
    label: msg('features:feature.perGroupVolume.label'),
    description: 'Per-group sub-volume scaling in the DSP so music and sound effects can be mixed separately.',
    userMessage: msg('features:feature.perGroupVolume.message'),
    group: 'Audio',
    kind: 'features0-bit',
    origin: 'relic',
    flag: 'kFeatures0_PerGroupVolume',
    bit: 524288,
    default: false,
    requires: [],
    affectsVanillaParity: true,
    live: true,
  },
];

export { AUDIO_FEATURES };
