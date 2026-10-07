/* @layer bridge-wasm @kind logic */
/**
 * Tells the core which entrances the extended pack gives a track of their own.
 *
 * The remap tables are the renderer's, and the core keeps no copy. It only needs to know, per
 * entrance, whether a dedicated track exists, so it can hand the game a selectable indoor song
 * for the entrances whose own byte would never select one (a duck, or an overworld song carried
 * indoors). Pushed as a bitmask, 32 entrances per word, whenever a session starts.
 */
import { DELUXE_ENTRANCE_TRACKS } from '@shared/game/data/msu-deluxe-remap';
import { voidCall } from './wasm-call';

const WORDS = 5;

const push = (index: number, bits: number): void =>
  voidCall('WasmSetDeluxeEntrances', { argTypes: ['number', 'number'], args: [index, bits >>> 0] });

/** Arm the mask for an extended pack, or clear it for any other. */
const setDeluxeEntrances = (extended: boolean): void => {
  const words = new Array<number>(WORDS).fill(0);
  if (extended) {
    DELUXE_ENTRANCE_TRACKS.forEach((track, entrance) => {
      if (track !== null) words[entrance >> 5] |= 1 << (entrance & 31);
    });
  }
  words.forEach((bits, index) => push(index, bits));
};

export { setDeluxeEntrances };
