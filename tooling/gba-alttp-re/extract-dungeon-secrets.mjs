#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { dungeonRoomEntry } from './lib/dungeon-room-entry.mjs';
import { dungeonSourceInfo } from './lib/dungeon-source-info.mjs';
import { parseDungeonSecretList } from './lib/dungeon-secrets.mjs';
import { readGbaRoomPointer } from './lib/gba-room-pointer.mjs';
import { loadDungeonSources } from './lib/load-dungeon-sources.mjs';
import { readSnesRoomOffset } from './lib/snes-room-pointer.mjs';
import { writeJsonArtifact } from './lib/write-json-artifact.mjs';

const GBA_POINTER_TABLE_OFFSET = 0x2264c8;
const GBA_ROOM_COUNT = 320;
const SNES_POINTER_TABLE = 0x81db69;
const SNES_DATA_BANK = 0x810000;

const sources = loadDungeonSources('tooling/gba-alttp-re/artifacts/gba-dungeon-secrets.json');
const { gba, snes, outPath } = sources;

const readSnesList = roomId => parseDungeonSecretList(
  snes,
  readSnesRoomOffset(snes, SNES_POINTER_TABLE, SNES_DATA_BANK, roomId),
);

const rooms = [];
let exactSnesMatches = 0;
const modifiedSnesRooms = [];
for (let roomId = 0; roomId < GBA_ROOM_COUNT; roomId++) {
  const source = readGbaRoomPointer(gba, GBA_POINTER_TABLE_OFFSET, roomId);
  const parsed = parseDungeonSecretList(gba, source.offset);
  const snesList = readSnesList(roomId);
  const snesComparison = parsed.raw.equals(snesList.raw) ? 'exact' : 'modified';
  if (snesComparison === 'exact') exactSnesMatches++;
  else modifiedSnesRooms.push(roomId);

  rooms.push(dungeonRoomEntry(roomId, source, parsed, snesComparison));
}

const result = {
  format: 'alttp-gba-dungeon-secrets-v1',
  source: dungeonSourceInfo(sources),
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

writeJsonArtifact(outPath, result);
console.log(JSON.stringify({ outPath, ...result.summary }, null, 2));
