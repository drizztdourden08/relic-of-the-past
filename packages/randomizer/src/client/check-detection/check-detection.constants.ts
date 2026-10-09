/* @layer bridge-wasm @kind constants */
const CHEST_MASK_BASE = 0x10;

const EMPTY_RUNG = 0;

const EMPTY_RUNG_FLAG_OF_TIER_BYTE: ReadonlyMap<number, number> = new Map([[23, 27], [24, 28]]);

export { CHEST_MASK_BASE, EMPTY_RUNG, EMPTY_RUNG_FLAG_OF_TIER_BYTE };
