/* @layer shared-asset-extraction @kind logic */
import type { ByteCursor, CommandHeader } from './lz-decompress.type';

const readCommandHeader = (first: number, cursor: ByteCursor): CommandHeader => {
  if ((first & 0xe0) !== 0xe0) return { cmd: first & 0xe0, count: (first & 0x1f) + 1 };
  const cmd = (first << 3) & 0xe0;
  const count = (((first & 3) << 8) | cursor.next()) + 1;
  return { cmd, count };
};

export { readCommandHeader };
