#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  hashBuffer,
  parseArgs,
  resolveGbaRom,
  resolveSnesRom,
  snesAddressToOffset,
} from './lib/common.mjs';
import { parseDungeonSpriteList } from './lib/dungeon-sprites.mjs';

const GBA_POINTER_TABLE_OFFSET = 0x228df0;
const GBA_ROOM_COUNT = 384;
const SNES_POINTER_TABLE = 0x89d62e;
const SNES_DATA_BANK = 0x890000;
const SNES_ROOM_COUNT = 320;

const args = parseArgs(process.argv.slice(2));
const gbaPath = resolveGbaRom(args.gba ?? args.rom);
const snesPath = resolveSnesRom(args.snes);
const outPath = resolve(args.out ?? 'scripts/gba-alttp-re/artifacts/gba-dungeon-sprites.json');
const gba = readFileSync(gbaPath);
const snes = readFileSync(snesPath);

const readSnesList = roomId => {
  const table = snesAddressToOffset(SNES_POINTER_TABLE);
  const pointer = snes.readUInt16LE(table + roomId * 2);
  return parseDungeonSpriteList(snes, snesAddressToOffset(SNES_DATA_BANK + pointer), roomId);
};

const rooms = [];
let exactSnesMatches = 0;
const modifiedSnesRooms = [];
for (let roomId = 0; roomId < GBA_ROOM_COUNT; roomId++) {
  const pointer = gba.readUInt32LE(GBA_POINTER_TABLE_OFFSET + roomId * 4);
  if (pointer < 0x08000000 || pointer >= 0x08800000) {
    throw new Error(`Room 0x${roomId.toString(16)} has invalid pointer 0x${pointer.toString(16)}`);
  }
  const offset = pointer - 0x08000000;
  const parsed = parseDungeonSpriteList(gba, offset, roomId);
  let snesComparison = 'extension';
  if (roomId < SNES_ROOM_COUNT) {
    const snesList = readSnesList(roomId);
    snesComparison = parsed.raw.equals(snesList.raw) ? 'exact' : 'modified';
    if (snesComparison === 'exact') exactSnesMatches++;
    else modifiedSnesRooms.push(roomId);
  }

  rooms.push({
    roomId,
    pointer: `0x${pointer.toString(16).toUpperCase().padStart(8, '0')}`,
    fileOffset: `0x${offset.toString(16).toUpperCase().padStart(8, '0')}`,
    sortMode: parsed.sortMode,
    snesComparison,
    records: parsed.records,
    rawHex: parsed.raw.toString('hex'),
  });
}

const result = {
  format: 'alttp-gba-dungeon-sprites-v1',
  source: {
    gbaPath,
    gbaSha256: hashBuffer(gba, 'sha256'),
    snesPath,
    snesSha1: hashBuffer(snes, 'sha1'),
  },
  table: {
    pointerTable: '0x08228DF0',
    pointerTableFileOffset: '0x00228DF0',
    roomCount: GBA_ROOM_COUNT,
    loader: '0x080CB5A0',
    recordLoader: '0x080CB638',
  },
  summary: {
    originalRoomCount: SNES_ROOM_COUNT,
    exactSnesMatches,
    modifiedSnesRoomCount: modifiedSnesRooms.length,
    modifiedSnesRooms,
    gbaExtensionRoomCount: GBA_ROOM_COUNT - SNES_ROOM_COUNT,
  },
  rooms,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ outPath, ...result.summary }, null, 2));
