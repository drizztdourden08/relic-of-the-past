#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { hashBuffer, parseArgs, parseInteger, resolveGbaRom } from './lib/common.mjs';
import { parseDungeonRoomLayer } from './lib/dungeon-room-layers.mjs';
import { decompressGbaLz77 } from './lib/gba-lz77.mjs';

const ROOM_COUNT = 320;
const LAYER_TABLES = [0x1618d8, 0x161d98, 0x162258];

const args = parseArgs(process.argv.slice(2));
const roomId = parseInteger(args.room ?? '0x88', 'room');
if (roomId < 0 || roomId >= ROOM_COUNT) throw new Error(`Room must be between 0 and ${ROOM_COUNT - 1}`);

const romPath = resolveGbaRom(args.gba ?? args.rom);
const rom = readFileSync(romPath);
const outPath = resolve(args.out ?? `scripts/gba-alttp-re/artifacts/room-${roomId.toString(16).padStart(3, '0')}-layers.json`);
const layers = LAYER_TABLES.map((table, index) => {
  const pointer = rom.readUInt32LE(table + roomId * 4);
  if (pointer < 0x08000000 || pointer >= 0x08800000) throw new Error(`Invalid layer pointer 0x${pointer.toString(16)}`);
  const fileOffset = pointer - 0x08000000;
  const decompressed = decompressGbaLz77(rom, fileOffset);
  const map = parseDungeonRoomLayer(decompressed.output);
  return {
    layer: index + 1,
    pointer: `0x${pointer.toString(16).toUpperCase().padStart(8, '0')}`,
    fileOffset: `0x${fileOffset.toString(16).toUpperCase().padStart(8, '0')}`,
    compressedSize: decompressed.compressedSize,
    raw: decompressed.output,
    ...map,
  };
});

const result = {
  format: 'alttp-gba-dungeon-layers-v1',
  source: { romPath, sha256: hashBuffer(rom, 'sha256') },
  roomId,
  layers: layers.map(({ raw, ...layer }) => ({ ...layer, rawHex: raw.toString('hex') })),
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
for (const layer of layers) {
  writeFileSync(resolve(dirname(outPath), `room-${roomId.toString(16).padStart(3, '0')}-layer-${layer.layer}.bin`), layer.raw);
}
console.log(JSON.stringify({
  outPath,
  roomId,
  layers: layers.map(layer => ({
    layer: layer.layer,
    pointer: layer.pointer,
    compressedSize: layer.compressedSize,
    decompressedSize: layer.raw.length,
  })),
}, null, 2));
