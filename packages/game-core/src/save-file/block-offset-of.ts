/* @layer bridge-wasm @kind logic */
import { SAVE_BLOCK_BASE } from './hook-save-bytes';

const blockOffsetOf = (wramAddress: number): number => wramAddress - SAVE_BLOCK_BASE;

export { blockOffsetOf };
