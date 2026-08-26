/* @layer shared-asset-extraction @kind data */
/**
 * Hardware-captured palettes for the extended palette ids.
 *
 * These ids index past the cartridge's palette table, so their records cannot be extracted
 * from ROM. Each entry here is the live palette RAM of the running cartridge, read in the
 * room that uses the id (background rows 2-7, sixteen colors per row, BGR555) - the same
 * six-row block the room palette record carries.
 */

const EXTENDED_PALETTES: Readonly<Record<number, readonly number[]>> = {
  // Captured standing in the water room (id 0xdd): row 7 carries the water-surface blues.
  0x29: [
    0x7fff, 0x0c63, 0x2108, 0x35ad, 0x4a52, 0x6739, 0x31cc, 0x298a,
    0x7fff, 0x0c63, 0x2108, 0x35ad, 0x4a52, 0x6739, 0x2569, 0x1d27,
    0x7fff, 0x18c6, 0x2d6b, 0x5294, 0x77bd, 0x252f, 0x1aba, 0x29f5,
    0x7fff, 0x1084, 0x2148, 0x298a, 0x31ac, 0x2148, 0x35ad, 0x2569,
    0x7fff, 0x0c63, 0x2108, 0x35ad, 0x4a52, 0x6739, 0x1ad7, 0x19ae,
    0x0000, 0x1084, 0x1906, 0x1d27, 0x2569, 0x1906, 0x2108, 0x1d27,
    0x7fff, 0x0c63, 0x2d6b, 0x5294, 0x739c, 0x2e26, 0x4f8a, 0x3aa6,
    0x7fff, 0x10c7, 0x1109, 0x1d8d, 0x29f0, 0x42f8, 0x5f9d, 0x7fff,
    0x7fff, 0x18c6, 0x2110, 0x35b8, 0x739c, 0x4108, 0x1aba, 0x61ad,
    0x7fff, 0x1084, 0x10e9, 0x152b, 0x1d6d, 0x298a, 0x5294, 0x739c,
    0x7fff, 0x1463, 0x58e6, 0x6149, 0x658b, 0x44e7, 0x5d69, 0x7a2e,
    0x7fff, 0x0c63, 0x1ce7, 0x0000, 0x0000, 0x1dcc, 0x4a52, 0x35ad,
  ],
};

/**
 * Object palette rows the dungeon's fixtures use, same capture. Row number then sixteen
 * colors; the engine writes each into the corresponding sprite palette row.
 */
const OBJ_PALETTE_ROWS: readonly { row: number; colors: readonly number[] }[] = [
  { row: 4, colors: [
    0x0000, 0x7fff, 0x319b, 0x1596, 0x369e, 0x14a5, 0x7e56, 0x65ca,
    0x0000, 0x7fff, 0x0cd9, 0x1a49, 0x3b53, 0x14a5, 0x1f5f, 0x1237,
  ] },
  { row: 6, colors: [
    0x0000, 0x7fff, 0x1966, 0x0d9c, 0x02bb, 0x14a5, 0x4b0a, 0x2e28,
    0x0000, 0x18c6, 0x2d6b, 0x29f5, 0x1aba, 0x252f, 0x77bd, 0x5294,
  ] },
];

const objPaletteRecords = (): Buffer => Buffer.concat(OBJ_PALETTE_ROWS.map(({ row, colors }) => {
  const record = Buffer.alloc(1 + colors.length * 2);
  record[0] = row;
  colors.forEach((color, i) => record.writeUInt16LE(color, 1 + i * 2));
  return record;
}));

const extendedPaletteRecord = (paletteId: number): Buffer | null => {
  const colors = EXTENDED_PALETTES[paletteId];
  if (!colors) return null;
  const record = Buffer.alloc(colors.length * 2);
  colors.forEach((color, i) => record.writeUInt16LE(color, i * 2));
  return record;
};

export { extendedPaletteRecord, objPaletteRecords };
