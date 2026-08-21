#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { hashBuffer, parseArgs, resolveGbaRom, resolveSnesRom, snesAddressToOffset } from './lib/common.mjs';
import { parseDungeonSecretList } from './lib/dungeon-secrets.mjs';

const GBA_POINTER_TABLE_OFFSET = 0x2264c8;
const GBA_ROOM_COUNT = 320;
const SNES_POINTER_TABLE = 0x81db69;
const SNES_DATA_BANK = 0x810000;

const args = parseArgs(process.argv.slice(2));
const gbaPath = resolveGbaRom(args.gba ?? args.rom);
const snesPath = resolveSnesRom(args.snes);
const outPath = resolve(args.out ?? 'scripts/gba-alttp-re/artifacts/gba-dungeon-secrets.json');
const gba = readFileSync(gbaPath);
const snes = readFileSync(snesPath);

const readSnesList = roomId => {
  const table = snesAddressToOffset(SNES_POINTER_TABLE);
  const pointer = snes.readUInt16LE(table + roomId * 2);
  return parseDungeonSecretList(snes, snesAddressToOffset(SNES_DATA_BANK | pointer));
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
  const parsed = parseDungeonSecretList(gba, offset);
  const snesList = readSnesList(roomId);
  const snesComparison = parsed.raw.equals(snesList.raw) ? 'exact' : 'modified';
  if (snesComparison === 'exact') exactSnesMatches++;
  else modifiedSnesRooms.push(roomId);

  rooms.push({
    roomId,
    pointer: `0x${pointer.toString(16).toUpperCase().padStart(8, '0')}`,
    fileOffset: `0x${offset.toString(16).toUpperCase().padStart(8, '0')}`,
    snesComparison,
    records: parsed.records,
    rawHex: parsed.raw.toString('hex'),
  });
}

const result = {
  format: 'alttp-gba-dungeon-secrets-v1',
  source: {
    gbaPath,
    gbaSha256: hashBuffer(gba, 'sha256'),
    snesPath,
    snesSha1: hashBuffer(snes, 'sha1'),
  },
  table: {
    pointerTable: '0x082264C8',
    pointerTableFileOffset: '0x002264C8',
    roomCount: GBA_ROOM_COUNT,
    recordFormat: 'uint16 position, uint8 type, terminated by uint16 0xFFFF',
  },
  summary: {
    roomCount: GBA_ROOM_COUNT,
    exactSnesMatches,
    modifiedSnesRoomCount: modifiedSnesRooms.length,
    modifiedSnesRooms,
  },
  rooms,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ outPath, ...result.summary }, null, 2));
