/* @layer renderer-components @kind constants */
import { buildPairs } from './build-pairs';

const PAIRS = buildPairs();
const SECOND_HALVES = new Set<string>(PAIRS.values());

export { PAIRS, SECOND_HALVES };
