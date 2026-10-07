#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { hashBuffer, parseArgs, parseInteger, resolveGbaRom } from './lib/common.mjs';
import { parseDungeonRoomHeader } from './lib/dungeon-room-header.mjs';
import { parseDungeonRoomLayer } from './lib/dungeon-room-layers.mjs';
import { parseDungeonSecretList } from './lib/dungeon-secrets.mjs';
import { parseDungeonSpriteList } from './lib/dungeon-sprites.mjs';
import { decompressGbaLz77 } from './lib/gba-lz77.mjs';

const ROOM_COUNT = 320;
const HEADER_TABLE = 0x164020;
const SECRET_TABLE = 0x2264c8;
const SPRITE_TABLE = 0x228df0;
const LAYER_TABLES = [0x1618d8, 0x161d98, 0x162258];

const args = parseArgs(process.argv.slice(2));
const roomId = parseInteger(args.room ?? '0x88', 'room');
if (roomId < 0 || roomId >= ROOM_COUNT) throw new Error(`Room must be between 0 and ${ROOM_COUNT - 1}`);

const romPath = resolveGbaRom(args.gba ?? args.rom);
const rom = readFileSync(romPath);
const readPointer = tableOffset => {
  const pointer = rom.readUInt32LE(tableOffset + roomId * 4);
  if (pointer < 0x08000000 || pointer >= 0x08800000) {
    throw new Error(`Room 0x${roomId.toString(16)} has invalid pointer 0x${pointer.toString(16)}`);
  }
  return { pointer, offset: pointer - 0x08000000 };
};
const pointerJson = value => ({
  address: `0x${value.pointer.toString(16).toUpperCase().padStart(8, '0')}`,
  fileOffset: `0x${value.offset.toString(16).toUpperCase().padStart(8, '0')}`,
});

const headerSource = readPointer(HEADER_TABLE);
const secretSource = readPointer(SECRET_TABLE);
const spriteSource = readPointer(SPRITE_TABLE);
const header = parseDungeonRoomHeader(rom, headerSource.offset);
const secrets = parseDungeonSecretList(rom, secretSource.offset);
const sprites = parseDungeonSpriteList(rom, spriteSource.offset, roomId);
const layers = LAYER_TABLES.map((table, index) => {
  const source = readPointer(table);
  const decompressed = decompressGbaLz77(rom, source.offset);
  return {
    layer: index + 1,
    source: pointerJson(source),
    compressedSize: decompressed.compressedSize,
    rawHex: decompressed.output.toString('hex'),
    ...parseDungeonRoomLayer(decompressed.output),
  };
});

const outPath = resolve(args.out ?? `scripts/gba-alttp-re/artifacts/room-${roomId.toString(16).padStart(3, '0')}.json`);
const result = {
  format: 'alttp-gba-dungeon-room-v1',
  source: { romPath, sha256: hashBuffer(rom, 'sha256') },
  roomId,
  header: {
    source: pointerJson(headerSource),
    ...header,
    raw: undefined,
    rawHex: header.raw.toString('hex'),
  },
  layers,
  sprites: {
    source: pointerJson(spriteSource),
    sortMode: sprites.sortMode,
    records: sprites.records,
    rawHex: sprites.raw.toString('hex'),
  },
  secrets: {
    source: pointerJson(secretSource),
    records: secrets.records,
    rawHex: secrets.raw.toString('hex'),
  },
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  outPath,
  roomId,
  header: result.header,
  layerPointers: result.layers.map(layer => layer.source.address),
  spriteCount: result.sprites.records.length,
  secretCount: result.secrets.records.length,
}, null, 2));
