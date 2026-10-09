/* @layer bridge-wasm @kind logic */
import { DEFAULT_MID } from './usable-crossings.constants';

const midOf = (positions: readonly number[]): number =>
  positions[Math.floor(positions.length / 2)] ?? DEFAULT_MID;

export { midOf };
