#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { PNG } from 'pngjs';
import { hashBuffer, hex, parseArgs, parseInteger, resolveGbaRom } from './lib/common.mjs';
import {
  decodeGba4bppTile,
  decodeGbaPaletteBanks,
  renderBackgroundRegion,
} from './lib/gba-background-graphics.mjs';
import { parseDungeonRoomLayer } from './lib/dungeon-room-layers.mjs';
import { decompressGbaLz77 } from './lib/gba-lz77.mjs';

const EXPECTED_SHA256 = 'f328f8f07d736288a00c80d31cc1630f3aa02aaf20efdcba73d31dae832b5d76';
const ROOM_ID = 0x88;
const LAYER_TABLES = [0x1618d8, 0x161d98, 0x162258];
const ASSETS = {
  'skull-relief': { name: 'palace-of-the-four-sword-skull-wall-relief', region: { x: 23, y: 50, width: 4, height: 4 } },
  'left-statue': { name: 'palace-of-the-four-sword-left-entrance-statue', region: { x: 26, y: 57, width: 6, height: 6 } },
  entrance: { name: 'palace-of-the-four-sword-entrance-assembly', region: { x: 26, y: 55, width: 12, height: 8 } },
};
const PALETTE = { address: 0x083be558, firstBank: 2, bankCount: 6 };
const SHEETS = [
  { address: 0x08258e38, firstTile: 0 },
  { address: 0x0825e200, firstTile: 128 },
  { address: 0x0825b264, firstTile: 192 },
  { address: 0x0825d4a8, firstTile: 256 },
  { address: 0x08264ccc, firstTile: 320 },
];

const args = parseArgs(process.argv.slice(2));
const assetId = args.asset ?? 'skull-relief';
const asset = ASSETS[assetId];
if (!asset) throw new Error(`asset must be one of: ${Object.keys(ASSETS).join(', ')}`);
const region = asset.region;
const romPath = resolveGbaRom(args.gba ?? args.rom);
const outPath = resolve(args.out ?? `scripts/gba-alttp-re/artifacts/${assetId}-offline.png`);
const scale = parseInteger(args.scale ?? '4', 'scale');
if (scale < 1 || scale > 16) throw new Error('scale must be between 1 and 16');

const rom = readFileSync(romPath);
const sha256 = hashBuffer(rom, 'sha256');
if (sha256 !== EXPECTED_SHA256 && !args['allow-unknown-rom']) {
  throw new Error(`Unsupported ROM SHA-256 ${sha256}; pass --allow-unknown-rom only after validating its tables`);
}

const layers = LAYER_TABLES.map(table => {
  const pointer = rom.readUInt32LE(table + ROOM_ID * 4);
  return {
    pointer,
    ...parseDungeonRoomLayer(decompressGbaLz77(rom, pointer - 0x08000000).output),
  };
});

const tiles = new Map();
const sheetSources = SHEETS.map(sheet => {
  const decompressed = decompressGbaLz77(rom, sheet.address - 0x08000000);
  if (decompressed.output.length % 32 !== 0) throw new Error(`Tile sheet ${hex(sheet.address)} is not tile-aligned`);
  const tileCount = decompressed.output.length / 32;
  for (let tile = 0; tile < tileCount; tile++) {
    tiles.set(sheet.firstTile + tile, decodeGba4bppTile(decompressed.output, tile * 32));
  }
  return { ...sheet, compressedSize: decompressed.compressedSize, decompressedSize: decompressed.output.length, tileCount };
});

const paletteOffset = PALETTE.address - 0x08000000;
const paletteBytes = rom.subarray(paletteOffset, paletteOffset + PALETTE.bankCount * 32);
const palettes = decodeGbaPaletteBanks(paletteBytes, PALETTE.firstBank);
const rendered = renderBackgroundRegion({ layers, tiles, palettes, ...region });

const png = new PNG({ width: rendered.width * scale, height: rendered.height * scale });
for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const source = ((y / scale | 0) * rendered.width + (x / scale | 0)) * 4;
    const destination = (y * png.width + x) * 4;
    rendered.pixels.copy(png.data, destination, source, source + 4);
  }
}

const usedEntries = [];
for (let y = region.y; y < region.y + region.height; y++) {
  for (let x = region.x; x < region.x + region.width; x++) {
    usedEntries.push(...layers.map(layer => layer.cells[y][x]));
  }
}
const usedTileIds = [...new Set(usedEntries.map(entry => entry.tile))].filter(tile => tiles.has(tile)).sort((a, b) => a - b);
const usedPaletteBanks = [...new Set(usedEntries.map(entry => entry.palette))].filter(bank => palettes.has(bank)).sort((a, b) => a - b);
const provenance = {
  format: 'alttp-gba-background-asset-v1',
  asset: asset.name,
  source: { romPath, sha256 },
  roomId: ROOM_ID,
  region,
  layerPointers: layers.map(layer => hex(layer.pointer)),
  sheets: sheetSources.map(sheet => ({
    address: hex(sheet.address),
    firstTile: sheet.firstTile,
    tileCount: sheet.tileCount,
    compressedSize: sheet.compressedSize,
    decompressedSize: sheet.decompressedSize,
  })),
  palette: { address: hex(PALETTE.address), firstBank: PALETTE.firstBank, bankCount: PALETTE.bankCount },
  usedTileIds,
  usedPaletteBanks,
  output: { path: outPath, width: png.width, height: png.height, scale },
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, PNG.sync.write(png));
writeFileSync(`${outPath}.json`, `${JSON.stringify(provenance, null, 2)}\n`);
console.log(JSON.stringify(provenance, null, 2));
