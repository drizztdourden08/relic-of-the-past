/* @layer bridge-wasm @kind constants */
import type { PreviewTarget } from './sound-preview.type';

const PREVIEW_PORT: Record<PreviewTarget, number> = { music: 0, ambient: 1, sfx1: 2, sfx2: 3 };
const FRAMES_PER_SECOND = 60;
const FIND_BANK_FOR_SOUND = -1;
const STEREO_CHANNELS = 2;

export { PREVIEW_PORT, FRAMES_PER_SECOND, FIND_BANK_FOR_SOUND, STEREO_CHANNELS };
