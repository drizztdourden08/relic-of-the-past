/* @layer renderer-lib @kind logic */
import { oggCrc32 } from './ogg-crc32';
import { ascii } from './ascii';
import type { OggPage } from './ogg-opus.type';
import { OGG_LACING_UNIT, OGG_PAGE_HEADER_BYTES, OGG_STREAM_VERSION, UINT32 } from './ogg-opus.constants';

const laceTable = (packets: Uint8Array[]): number[] => {
  const table: number[] = [];
  packets.forEach(({ length }) => {
    let left = length;
    while (left >= OGG_LACING_UNIT) {
      table.push(OGG_LACING_UNIT);
      left -= OGG_LACING_UNIT;
    }
    table.push(left);
  });
  return table;
};

const buildOggPage = (page: OggPage, serial: number): Uint8Array => {
  const { flags, granule, sequence, packets } = page;
  const table = laceTable(packets);
  const bodyBytes = packets.reduce((sum, p) => sum + p.length, 0);
  const bytes = new Uint8Array(OGG_PAGE_HEADER_BYTES + table.length + bodyBytes);
  const view = new DataView(bytes.buffer);

  bytes.set(ascii('OggS'), 0);
  bytes[4] = OGG_STREAM_VERSION;
  bytes[5] = flags;
  view.setUint32(6, granule % UINT32, true);
  view.setUint32(10, Math.floor(granule / UINT32), true);
  view.setUint32(14, serial, true);
  view.setUint32(18, sequence, true);
  bytes[26] = table.length;
  bytes.set(table, 27);

  let at = OGG_PAGE_HEADER_BYTES + table.length;
  packets.forEach((p) => {
    bytes.set(p, at);
    at += p.length;
  });
  view.setUint32(22, oggCrc32(bytes), true);
  return bytes;
};

export { buildOggPage };
