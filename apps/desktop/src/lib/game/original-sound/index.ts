/* @layer bridge-wasm @kind barrel */
export { canPreviewOriginals } from '@rotp/game-core';
export { playOriginalSound } from './play-original-sound';
export { stopOriginalSound } from './stop-original-sound';
export { probeAudibleIds } from './probe-audible-ids';
export { PREVIEW_SECONDS, PROBE_SECONDS } from './original-sound.constants';
export type { OriginalSound, PlayOutcome } from './original-sound.type';
export type { PreviewTarget } from '@rotp/game-core';
