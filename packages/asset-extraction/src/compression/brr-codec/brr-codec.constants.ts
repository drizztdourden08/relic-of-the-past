/* @layer shared-asset-extraction @kind constants */
const BRR_BLOCK_SAMPLES = 16;

const BRR_NIBBLE_ORDER = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, -8] as const;

const BRR_FILTER_COUNT = 4;

const BRR_MAX_RANGE = 12;

export { BRR_BLOCK_SAMPLES, BRR_FILTER_COUNT, BRR_MAX_RANGE, BRR_NIBBLE_ORDER };
