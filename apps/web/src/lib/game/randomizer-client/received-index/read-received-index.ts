/* @layer bridge-wasm @kind logic */
import { getApReceivedIndex } from '../../ap-received-index';
import { fallbackReceivedIndex } from './fallback-received-index';

const readReceivedIndex = (): number => getApReceivedIndex() ?? fallbackReceivedIndex.value;

export { readReceivedIndex };
