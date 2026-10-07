/* @layer scripts @kind tooling */
const GBA_TILE_BYTES = 32;
const GBA_TILE_SIZE = 8;

const decodeGba4bppTile = (data, offset = 0) => {
  if (offset < 0 || offset + GBA_TILE_BYTES > data.length) {
    throw new Error(`GBA 4bpp tile offset is out of range: 0x${offset.toString(16)}`);
  }
  const pixels = new Uint8Array(GBA_TILE_SIZE * GBA_TILE_SIZE);
  for (let y = 0; y < GBA_TILE_SIZE; y++) {
    for (let x = 0; x < GBA_TILE_SIZE; x++) {
      const packed = data[offset + y * 4 + (x >>> 1)];
      pixels[y * GBA_TILE_SIZE + x] = x & 1 ? packed >>> 4 : packed & 0x0f;
    }
  }
  return pixels;
};

const decodeGbaColor = color => [
  Math.round((color & 0x1f) * 255 / 31),
  Math.round(((color >>> 5) & 0x1f) * 255 / 31),
  Math.round(((color >>> 10) & 0x1f) * 255 / 31),
  0xff,
];

const decodeGbaPaletteBanks = (data, firstBank) => {
  if (data.length % 32 !== 0) throw new Error('GBA 4bpp palette data must contain complete 32-byte banks');
  const banks = new Map();
  for (let bank = 0; bank < data.length / 32; bank++) {
    const colors = [];
    for (let color = 0; color < 16; color++) {
      colors.push(decodeGbaColor(data.readUInt16LE(bank * 32 + color * 2)));
    }
    banks.set(firstBank + bank, colors);
  }
  return banks;
};

const renderBackgroundRegion = ({ layers, tiles, palettes, x, y, width, height }) => {
  const pixelWidth = width * GBA_TILE_SIZE;
  const pixelHeight = height * GBA_TILE_SIZE;
  const pixels = Buffer.alloc(pixelWidth * pixelHeight * 4);
  for (let pixel = 0; pixel < pixelWidth * pixelHeight; pixel++) pixels[pixel * 4 + 3] = 0xff;

  for (let tileY = 0; tileY < height; tileY++) {
    for (let tileX = 0; tileX < width; tileX++) {
      for (const layer of layers) {
        const entry = layer.cells[y + tileY][x + tileX];
        const tile = tiles.get(entry.tile);
        if (!tile) continue;
        const palette = palettes.get(entry.palette);
        if (!palette) throw new Error(`Missing palette bank ${entry.palette} for tile ${entry.tile}`);
        for (let py = 0; py < GBA_TILE_SIZE; py++) {
          for (let px = 0; px < GBA_TILE_SIZE; px++) {
            const sourceX = entry.horizontalFlip ? 7 - px : px;
            const sourceY = entry.verticalFlip ? 7 - py : py;
            const colorIndex = tile[sourceY * GBA_TILE_SIZE + sourceX];
            if (colorIndex === 0) continue;
            const color = palette[colorIndex];
            const destination = ((tileY * 8 + py) * pixelWidth + tileX * 8 + px) * 4;
            pixels[destination] = color[0];
            pixels[destination + 1] = color[1];
            pixels[destination + 2] = color[2];
            pixels[destination + 3] = color[3];
          }
        }
      }
    }
  }
  return { width: pixelWidth, height: pixelHeight, pixels };
};

export {
  GBA_TILE_BYTES,
  GBA_TILE_SIZE,
  decodeGba4bppTile,
  decodeGbaColor,
  decodeGbaPaletteBanks,
  renderBackgroundRegion,
};
