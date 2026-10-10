/* @layer bridge-wasm @kind logic */
import { DELUXE_ENTRANCE_TRACKS } from '@rotp/game-data';
import { voidCall } from './wasm-call';
import { ENTRANCE_BIT_MASK, ENTRANCE_MASK_WORDS, ENTRANCES_PER_WORD_SHIFT } from './deluxe-entrances.constants';

const pushMaskWord = (index: number, bits: number): void =>
  voidCall('WasmSetDeluxeEntrances', { argTypes: ['number', 'number'], args: [index, bits >>> 0] });

const setDeluxeEntrances = (extended: boolean): void => {
  const words = new Array<number>(ENTRANCE_MASK_WORDS).fill(0);
  if (extended) {
    DELUXE_ENTRANCE_TRACKS.forEach((track, entrance) => {
      const word = entrance >> ENTRANCES_PER_WORD_SHIFT;
      if (track !== null) words[word] = (words[word] ?? 0) | (1 << (entrance & ENTRANCE_BIT_MASK));
    });
  }
  words.forEach((bits, index) => pushMaskWord(index, bits));
};

export { setDeluxeEntrances };
