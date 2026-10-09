/* @layer bridge-wasm @kind logic */
import { isFileInPlay, onSaveSwap } from './randomizer-client/file-in-play';
import { wasStateJustLoaded } from './state-load-signal';

let lastSwapAt = 0;
onSaveSwap(() => { lastSwapAt = Date.now(); });

const isToastQuiet = (windowMs: number): boolean =>
  !isFileInPlay() || Date.now() - lastSwapAt < windowMs || wasStateJustLoaded(windowMs);

export { isToastQuiet };
