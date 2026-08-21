#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PNG } from 'pngjs';
import { parseArgs } from './lib/common.mjs';
import { parseDungeonRoomLayer } from './lib/dungeon-room-layers.mjs';

const WIDTH_TILES = 64;
const HEIGHT_TILES = 64;
const TILE_SIZE = 8;
const args = parseArgs(process.argv.slice(2));
const artifacts = resolve('scripts/gba-alttp-re/artifacts');
const vramPath = resolve(args.vram ?? `${artifacts}/palace-four-sword-vram.bin`);
const palettePath = resolve(args.palette ?? `${artifacts}/palace-four-sword-palram.bin`);
const outPath = resolve(args.out ?? `${artifacts}/palace-room-088-geometry.png`);
const vram = readFileSync(vramPath);
const palette = readFileSync(palettePath);
if (vram.length !== 0x18000) throw new Error(`Expected 96 KiB VRAM capture, got ${vram.length} bytes`);
if (palette.length < 0x200) throw new Error(`Expected at least 512 bytes of background palette, got ${palette.length}`);

const decodeColor = index => {
  const color = palette.readUInt16LE(index * 2);
  return [
    Math.round((color & 0x1f) * 255 / 31),
    Math.round(((color >>> 5) & 0x1f) * 255 / 31),
    Math.round(((color >>> 10) & 0x1f) * 255 / 31),
  ];
};

const layerSources = [
  { name: 'background', screenBase: 0xa000 },
  { name: 'middle', screenBase: 0xc000 },
  { name: 'foreground', screenBase: 0xe000 },
];
const layers = layerSources.map(source => ({
  ...source,
  map: parseDungeonRoomLayer(vram.subarray(source.screenBase, source.screenBase + 0x2000)),
}));

const png = new PNG({ width: WIDTH_TILES * TILE_SIZE, height: HEIGHT_TILES * TILE_SIZE });
for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    let rgb = decodeColor(0);
    for (const layer of layers) {
      const entry = layer.map.cells[y >>> 3][x >>> 3];
      const tileX = entry.horizontalFlip ? 7 - (x & 7) : x & 7;
      const tileY = entry.verticalFlip ? 7 - (y & 7) : y & 7;
      const packed = vram[entry.tile * 32 + tileY * 4 + (tileX >>> 1)];
      const color = tileX & 1 ? packed >>> 4 : packed & 0x0f;
      if (color !== 0) rgb = decodeColor(entry.palette * 16 + color);
    }
    const out = (y * png.width + x) * 4;
    png.data[out] = rgb[0];
    png.data[out + 1] = rgb[1];
    png.data[out + 2] = rgb[2];
    png.data[out + 3] = 0xff;
  }
}

writeFileSync(outPath, PNG.sync.write(png));
console.log(JSON.stringify({ outPath, width: png.width, height: png.height, layers: layerSources }, null, 2));
