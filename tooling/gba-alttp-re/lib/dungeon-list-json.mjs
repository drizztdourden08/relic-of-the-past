/* @layer scripts @kind tooling */
import { formatGbaPointer } from './gba-room-pointer.mjs';

const dungeonListJson = (source, parsed) => ({
  source: formatGbaPointer(source),
  sortMode: parsed.sortMode,
  records: parsed.records,
  rawHex: parsed.raw.toString('hex'),
});

export { dungeonListJson };
