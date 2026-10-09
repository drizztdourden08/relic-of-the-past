/* @layer bridge-wasm @kind constants */
import type { PreviewTarget } from '../bridge/sound-preview';

const PREVIEW_SECONDS: Record<PreviewTarget, number> = {
  music: 60,
  ambient: 30,
  sfx1: 10,
  sfx2: 10,
};

const SILENCE_FLOOR = 24;

const CACHEABLE_SECONDS = 12;

const CONTINUOUS: PreviewTarget[] = ['music', 'ambient'];

const PROBE_SECONDS = 2;

const PCM_FULL_SCALE = 32768;

export { PREVIEW_SECONDS, SILENCE_FLOOR, CACHEABLE_SECONDS, CONTINUOUS, PROBE_SECONDS, PCM_FULL_SCALE };
