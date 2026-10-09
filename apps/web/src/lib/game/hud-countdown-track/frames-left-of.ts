/* @layer bridge-wasm @kind logic */
import { FRAMES_PER_SECOND } from './hud-countdown-track.constants';

const framesLeftOf = (seconds: number, frames: number): number =>
  Math.max(0, (seconds - 1) * FRAMES_PER_SECOND + frames);

export { framesLeftOf };
