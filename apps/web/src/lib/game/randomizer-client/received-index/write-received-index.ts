/* @layer bridge-wasm @kind logic */
import { setApReceivedIndex } from '../../ap-received-index';
import { fallbackReceivedIndex } from './fallback-received-index';

const writeReceivedIndex = (index: number): void => {
  fallbackReceivedIndex.value = index;
  setApReceivedIndex(index);
};

export { writeReceivedIndex };
