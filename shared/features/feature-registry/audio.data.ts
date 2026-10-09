/* @layer shared @kind data */
import type { FeatureDef } from '../feature.type';

const AUDIO_FEATURES: FeatureDef[] = [
  {
    id: 'perGroupVolume',
    label: 'Independent music / SFX volume',
    description: 'Per-group sub-volume scaling in the DSP so music and sound effects can be mixed separately.',
    userMessage:
      'Lets you set music and sound-effect volumes independently. When off, the emulated audio mix is bit-identical to the original. Turn on to use the separate volume sliders.',
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
