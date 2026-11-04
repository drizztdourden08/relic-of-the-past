/* @layer shared-storage @kind constants */
import type { MsuSoundChannel } from '@drizztdourden08/brock-msu';

const ALTTP_GAME_ID = 'alttp';

const ALTTP_PACK_ROOT = 'msu';

const ALTTP_SOUND_ID_COUNT = 64;

const ALTTP_SOUND_CHANNELS: readonly MsuSoundChannel[] = [
  { name: 'ambient', kind: 'stateful', bus: 'ambient', coreIndex: 0, previewSeconds: 30 },
  { name: 'sfx1', kind: 'additive', bus: 'sfx', coreIndex: 1, previewSeconds: 10 },
  { name: 'sfx2', kind: 'additive', bus: 'sfx', coreIndex: 2, previewSeconds: 10 },
];

const ALTTP_MUSIC_PAUSE = 0xf0;
const ALTTP_MUSIC_FADE_OUT = 0xf1;
const ALTTP_MUSIC_DUCK = 0xf2;
const ALTTP_MUSIC_FULL_VOLUME = 0xf3;
const ALTTP_CHIP_ONLY_MASK = 0xf0;

const ALTTP_MUSIC_LABELS: Readonly<Record<number, string>> = {
  [ALTTP_MUSIC_PAUSE]: 'pause',
  [ALTTP_MUSIC_FADE_OUT]: 'fade out',
  [ALTTP_MUSIC_DUCK]: 'duck',
  [ALTTP_MUSIC_FULL_VOLUME]: 'full volume',
};

const ALTTP_FADES: Readonly<Record<number, { target: number; step: number }>> = {
  [ALTTP_MUSIC_FADE_OUT]: { target: 0, step: 7 },
  [ALTTP_MUSIC_DUCK]: { target: 64, step: 3 },
  [ALTTP_MUSIC_FULL_VOLUME]: { target: 255, step: 3 },
};

const ALTTP_TITLE_SCENES: ReadonlySet<number> = new Set([0, 1, 2, 3, 4, 20]);

const ALTTP_DELUXE_VARIANT = 'deluxe';

export {
  ALTTP_CHIP_ONLY_MASK, ALTTP_DELUXE_VARIANT, ALTTP_FADES, ALTTP_GAME_ID, ALTTP_MUSIC_LABELS, ALTTP_PACK_ROOT,
  ALTTP_SOUND_CHANNELS, ALTTP_SOUND_ID_COUNT, ALTTP_TITLE_SCENES,
};
