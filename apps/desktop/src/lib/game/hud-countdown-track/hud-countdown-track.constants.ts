/* @layer bridge-wasm @kind constants */
import type { CountdownTrack } from './hud-countdown-track.type';

const FRAMES_PER_SECOND = 62;

const IDLE_TRACK: CountdownTrack = { running: false, total: 0, totalFrames: 0, remaining: 0, fractionLeft: 0 };

export { FRAMES_PER_SECOND, IDLE_TRACK };
