/* @layer shared-asset-extraction @kind logic */
/**
 * The three-byte object encoding, mirrored from the engine's own decode.
 *
 * Subtype 1 packs column and width into the first byte and row and height into the second,
 * with the index in the third. Subtype 3 folds its size into the index and marks itself with
 * 0xf8 in the index byte's high bits. Subtype 2 is the odd one: the engine rebuilds its column
 * from bits 0-1 and 12-15 of the word and its row from bits 8-11 shifted up by two plus the
 * index byte's top two bits. Every encode round-trips through decode before it is emitted, so
 * a drift from the engine's reading cannot ship silently.
 */

interface DecodedObject {
  kind: number;
  index: number;
  w: number;
  h: number;
  col: number;
  row: number;
}

const encodeObject = (
  kind: number, index: number, w: number, h: number, col: number, row: number,
): [number, number, number] => {
  if (kind === 2) {
    return [
      0xfc | ((col >> 4) & 3),
      ((col & 0xf) << 4) | ((row >> 2) & 0xf),
      (index & 0x3f) | ((row & 3) << 6),
    ];
  }
  return [
    ((col << 2) & 0xff) | w,
    ((row << 2) & 0xff) | h,
    kind === 3 ? (0xf8 | (index >> 4)) : index,
  ];
};

/** Mirrors RoomData_DrawObject's reading of a stream entry, byte for byte. */
const decodeObject = (b0: number, b1: number, b2: number): DecodedObject => {
  const r0 = b0 | (b1 << 8);
  if ((r0 & 0xfc) !== 0xfc) {
    const w = r0 & 3;
    const h = (r0 >> 8) & 3;
    const col = (r0 & 0xff) >> 2;
    const row = r0 >> 10;
    if (b2 < 0xf8) return { kind: 1, index: b2, w, h, col, row };
    return { kind: 3, index: ((b2 & 7) << 4) | (h << 2) | w, w, h, col, row };
  }
  return {
    kind: 2,
    index: b2 & 0x3f,
    w: 0,
    h: 0,
    col: ((r0 & 3) << 4) | ((r0 >> 12) & 0xf),
    row: (((r0 >> 8) & 0xf) << 2) | (b2 >> 6),
  };
};

export { decodeObject, encodeObject };
export type { DecodedObject };
