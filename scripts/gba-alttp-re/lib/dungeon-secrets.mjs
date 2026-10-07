/* @layer scripts @kind tooling */
const decodeDungeonSecretRecord = (position, type) => {
  const cell = position >>> 1;
  return {
    position,
    type,
    x: cell % 64,
    y: Math.floor(cell / 64),
  };
};

const parseDungeonSecretList = (rom, offset, maxRecords = 64) => {
  if (offset < 0 || offset >= rom.length) throw new Error(`Secret list offset is out of range: ${offset}`);
  const start = offset;
  const records = [];

  while (offset + 1 < rom.length && rom.readUInt16LE(offset) !== 0xffff) {
    if (records.length >= maxRecords) throw new Error('Secret list has no terminator');
    if (offset + 3 > rom.length) throw new Error('Secret list has a truncated record');
    records.push(decodeDungeonSecretRecord(rom.readUInt16LE(offset), rom[offset + 2]));
    offset += 3;
  }

  if (offset + 1 >= rom.length || rom.readUInt16LE(offset) !== 0xffff) {
    throw new Error('Secret list has no terminator');
  }
  return { records, raw: rom.subarray(start, offset + 2), endOffset: offset + 2 };
};

export { decodeDungeonSecretRecord, parseDungeonSecretList };
