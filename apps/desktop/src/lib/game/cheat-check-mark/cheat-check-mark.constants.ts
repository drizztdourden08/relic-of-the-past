/* @layer bridge-wasm @kind constants */
const NO_ITEM_SENTINEL = 0xff;

const SUBSTITUTION_BUFFER_INDEXES: ReadonlySet<number> = new Set([21, 22, 25]);

const BUFFER_INDEX_OF_FLAG_TYPE: Readonly<Record<number, number>> = { 0: 1, 1: 0, 2: 2 };

export { NO_ITEM_SENTINEL, SUBSTITUTION_BUFFER_INDEXES, BUFFER_INDEX_OF_FLAG_TYPE };
