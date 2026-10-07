/* @layer bridge-wasm @kind logic */
/**
 * Whether a toast may show now. Nothing the player did can happen outside a file in play, so
 * the intro, the title, file select, naming and the attract demo stay quiet. So do the first
 * moments after the save under the game changes (a file entered from file select, a return to
 * the title, a state load): what the tracker finds done then was done in that file, not just now.
 */
import { isFileInPlay, onSaveSwap } from './randomizer-client/file-in-play';
import { wasStateJustLoaded } from './state-load-signal';

let lastSwapAt = 0;
onSaveSwap(() => { lastSwapAt = Date.now(); });

const isToastQuiet = (windowMs: number): boolean =>
  !isFileInPlay() || Date.now() - lastSwapAt < windowMs || wasStateJustLoaded(windowMs);

export { isToastQuiet };
