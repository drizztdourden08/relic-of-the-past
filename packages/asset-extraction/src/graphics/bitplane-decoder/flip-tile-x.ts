/* @layer shared-asset-extraction @kind logic */
const flipTileX = (pixels: Uint8Array): Uint8Array => {
  const flipped = new Uint8Array(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      flipped[y * 8 + x] = pixels[y * 8 + (7 - x)] ?? 0;
    }
  }
  return flipped;
};

export { flipTileX };
