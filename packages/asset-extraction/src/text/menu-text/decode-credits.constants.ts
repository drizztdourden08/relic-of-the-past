/* @layer shared-asset-extraction @kind constants */
const TEXT_ADDR = 0x8eb178;

const TEXT_SIZE = 1989;

const OFFSETS_ADDR = 0x8eb93d;

const ROW_COUNT = 394;

const EMPTY_ROW = 0xff;

const ROW_TILES = 32;

const COUNTER_COLUMN = 0x19;

const COUNTER_SCROLL_Y = [
  0x290, 0x298, 0x2a0, 0x2a8, 0x2b0, 0x2ba, 0x2c2,
  0x2ca, 0x2d2, 0x2da, 0x2e2, 0x2ea, 0x2f2, 0x310,
];

export { COUNTER_COLUMN, COUNTER_SCROLL_Y, EMPTY_ROW, OFFSETS_ADDR, ROW_COUNT, ROW_TILES, TEXT_ADDR, TEXT_SIZE };
