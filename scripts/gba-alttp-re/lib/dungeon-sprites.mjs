/* @layer scripts @kind tooling */
const decodeDungeonSpriteRecord = (roomId, y, x, type) => {
  if (type === 0xe4 && (y === 0xfd || y === 0xfe)) {
    return { kind: 'death-marker', action: y === 0xfe ? 1 : 2, raw: { y, x, type } };
  }

  const floor = y >>> 7;
  const localY = (y << 4) & 0x1ff;
  const localX = (x << 4) & 0x1ff;
  const worldY = localY + (((roomId >>> 3) & 0xfe) << 8);
  const worldX = localX + (((roomId & 0x0f) << 1) << 8);
  const subtype = ((y & 0x60) >>> 2) | (x >>> 5);

  return {
    kind: x >= 0xe0 ? 'overlord' : 'entity',
    type,
    floor,
    subtype,
    local: { x: localX, y: localY },
    world: { x: worldX, y: worldY },
    raw: { y, x, type },
  };
};

const parseDungeonSpriteList = (rom, offset, roomId, maxRecords = 64) => {
  if (offset < 0 || offset >= rom.length) throw new Error(`Sprite list offset is out of range: ${offset}`);
  const start = offset;
  const sortMode = rom[offset++];
  const records = [];

  while (offset < rom.length && rom[offset] !== 0xff) {
    if (records.length >= maxRecords) throw new Error(`Room 0x${roomId.toString(16)} has no terminator`);
    if (offset + 3 > rom.length) throw new Error(`Room 0x${roomId.toString(16)} has a truncated record`);
    records.push(decodeDungeonSpriteRecord(roomId, rom[offset], rom[offset + 1], rom[offset + 2]));
    offset += 3;
  }

  if (rom[offset] !== 0xff) throw new Error(`Room 0x${roomId.toString(16)} has no terminator`);
  return { sortMode, records, raw: rom.subarray(start, offset + 1), endOffset: offset + 1 };
};

export { decodeDungeonSpriteRecord, parseDungeonSpriteList };
