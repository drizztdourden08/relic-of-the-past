/* @layer shared-game-data @kind logic */
import { TRACK_REPEATS } from './msu-track-repeat.data';

const trackRepeats = (trackNum: number): boolean =>
  trackNum >= TRACK_REPEATS.length ? true : TRACK_REPEATS[trackNum] === 1;

export { trackRepeats };
