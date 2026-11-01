/* @layer shared-asset-extraction @kind logic */
const decodePlanarTile = (
  data: Buffer | Uint8Array,
  offset: number,
  planes: number,
  planeByte: (plane: number, row: number) => number,
): Uint8Array => {
  const pixels = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    for (let plane = 0; plane < planes; plane++) {
      const rowBits = data[offset + planeByte(plane, y)] ?? 0;
      for (let x = 0; x < 8; x++) {
        const index = y * 8 + x;
        pixels[index] = (pixels[index] ?? 0) | (((rowBits >>> (7 - x)) & 1) << plane);
      }
    }
  }
  return pixels;
};

export { decodePlanarTile };
