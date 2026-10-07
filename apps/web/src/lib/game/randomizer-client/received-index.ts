/* @layer bridge-wasm @kind logic */
/**
 * How many server items this save has already been handed. The core keeps it in the save
 * (ap-received-index.ts); an older core without that export falls back to a value held
 * here, which lasts only for this page.
 */
import { getApReceivedIndex, setApReceivedIndex } from '../ap-received-index';

let memoryIndex = 0;

const readReceivedIndex = (): number => getApReceivedIndex() ?? memoryIndex;

const writeReceivedIndex = (index: number): void => {
  memoryIndex = index;
  setApReceivedIndex(index);
};

export { readReceivedIndex, writeReceivedIndex };
