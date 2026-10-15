/* @layer scripts @kind tooling */
const DUNGEON_LAYER_WIDTH = 64;
const DUNGEON_LAYER_HEIGHT = 64;
const DUNGEON_LAYER_SIZE = DUNGEON_LAYER_WIDTH * DUNGEON_LAYER_HEIGHT * 2;

const decodeTextBackgroundEntry = raw => ({
  raw,
  tile: raw & 0x03ff,
  horizontalFlip: Boolean(raw & 0x0400),
  verticalFlip: Boolean(raw & 0x0800),
  palette: raw >>> 12,
});

const parseDungeonRoomLayer = buffer => {
  if (buffer.length !== DUNGEON_LAYER_SIZE) {
    throw new Error(`Expected 0x2000-byte dungeon layer, got 0x${buffer.length.toString(16)}`);
  }
  const cells = [];
  for (let y = 0; y < DUNGEON_LAYER_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < DUNGEON_LAYER_WIDTH; x++) {
      const screenBlock = (y >>> 5) * 2 + (x >>> 5);
      const entry = screenBlock * 1024 + (y & 31) * 32 + (x & 31);
      row.push(decodeTextBackgroundEntry(buffer.readUInt16LE(entry * 2)));
    }
    cells.push(row);
  }
  return { width: DUNGEON_LAYER_WIDTH, height: DUNGEON_LAYER_HEIGHT, cells };
};

export {
  DUNGEON_LAYER_HEIGHT,
  DUNGEON_LAYER_SIZE,
  DUNGEON_LAYER_WIDTH,
  decodeTextBackgroundEntry,
  parseDungeonRoomLayer,
};
