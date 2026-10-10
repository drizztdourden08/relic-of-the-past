/* @layer shared-asset-extraction @kind logic */
const decode3bppTile = (data: Buffer | Uint8Array, offset: number): Uint8Array => {
  const pixels = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    const d0 = data[offset + y * 2] ?? 0;
    const d1 = data[offset + y * 2 + 1] ?? 0;
    const d2 = data[offset + 16 + y] ?? 0;
    for (let x = 0; x < 8; x++) {
      const bit = 7 - x;
      pixels[y * 8 + x] =
        ((d0 >>> bit) & 1) |
        (((d1 >>> bit) & 1) << 1) |
        (((d2 >>> bit) & 1) << 2);
    }
  }
  return pixels;
};

export { decode3bppTile };
