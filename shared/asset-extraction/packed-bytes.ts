/* @layer shared-asset-extraction @kind logic */
/**
 * Buffer-free reader/writer for the packed-array format the core parses with
 * FindIndexInMemblk (util.c): (count-1) offsets relative to the end of the
 * offset table, the concatenated parts, then a u16 trailer holding count-1
 * (16-bit offsets) or 8192 + count-1 (32-bit offsets). packPackedBytes mirrors
 * asset-builder.ts packArrays byte-for-byte; unpackPackedBytes is its inverse.
 */

const unpackPackedBytes = (data: Uint8Array): Uint8Array[] => {
  if (data.length < 2) return [];
  const end = data.length - 2;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let mx = view.getUint16(end, true);
  const wide = mx >= 8192;
  if (wide) mx -= 8192;
  const cell = wide ? 4 : 2;
  if (mx * cell > end) return [];
  const offsetAt = (i: number): number =>
    wide ? view.getUint32(i * 4, true) : view.getUint16(i * 2, true);
  const parts: Uint8Array[] = [];
  for (let i = 0; i <= mx; i++) {
    const left = i === 0 ? mx * cell : mx * cell + offsetAt(i - 1);
    const right = i === mx ? end : mx * cell + offsetAt(i);
    if (left > right || right > end) return [];
    parts.push(data.subarray(left, right));
  }
  return parts;
};

const packPackedBytes = (parts: readonly Uint8Array[]): Uint8Array => {
  if (parts.length === 0) return new Uint8Array(0);
  const offsets: number[] = [];
  let offs = 0;
  for (let i = 0; i < parts.length - 1; i++) {
    offs += parts[i].length;
    offsets.push(offs);
  }
  // Same width rule as packArrays: 16-bit while every offset fits and the count allows.
  const wide = !(offs < 65536 && parts.length <= 8192);
  const cell = wide ? 4 : 2;
  const dataLen = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(offsets.length * cell + dataLen + 2);
  const view = new DataView(out.buffer);
  offsets.forEach((offset, i) => {
    if (wide) view.setUint32(i * 4, offset, true);
    else view.setUint16(i * 2, offset, true);
  });
  let at = offsets.length * cell;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  view.setUint16(at, (wide ? 8192 : 0) + parts.length - 1, true);
  return out;
};

export { packPackedBytes, unpackPackedBytes };
