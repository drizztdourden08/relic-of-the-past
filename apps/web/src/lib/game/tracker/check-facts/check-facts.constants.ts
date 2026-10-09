/* @layer bridge-wasm @kind constants */
const CHEST_OPEN_MASKS = [0x10, 0x20, 0x40, 0x80, 0x100, 0x200, 0x400] as const;
const BED_STATE_BUFFER_INDEX = 12;

export { CHEST_OPEN_MASKS, BED_STATE_BUFFER_INDEX };
