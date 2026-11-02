#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { dungeonRoomEntry } from './lib/dungeon-room-entry.mjs';
import { dungeonSourceInfo } from './lib/dungeon-source-info.mjs';
import { parseDungeonSpriteList } from './lib/dungeon-sprites.mjs';
import { readGbaRoomPointer } from './lib/gba-room-pointer.mjs';
import { loadDungeonSources } from './lib/load-dungeon-sources.mjs';
import { readSnesRoomOffset } from './lib/snes-room-pointer.mjs';
import { writeJsonArtifact } from './lib/write-json-artifact.mjs';

const GBA_POINTER_TABLE_OFFSET = 0x228df0;
const GBA_ROOM_COUNT = 384;
const SNES_POINTER_TABLE = 0x89d62e;
const SNES_DATA_BANK = 0x890000;
const SNES_ROOM_COUNT = 320;

const sources = loadDungeonSources('tooling/gba-alttp-re/artifacts/gba-dungeon-sprites.json');
const { gba, snes, outPath } = sources;

const readSnesList = roomId => parseDungeonSpriteList(
  snes,
  readSnesRoomOffset(snes, SNES_POINTER_TABLE, SNES_DATA_BANK, roomId),
  roomId,
);

const rooms = [];
let exactSnesMatches = 0;
const modifiedSnesRooms = [];
for (let roomId = 0; roomId < GBA_ROOM_COUNT; roomId++) {
  const source = readGbaRoomPointer(gba, GBA_POINTER_TABLE_OFFSET, roomId);
  const parsed = parseDungeonSpriteList(gba, source.offset, roomId);
  let snesComparison = 'extension';
  if (roomId < SNES_ROOM_COUNT) {
    const snesList = readSnesList(roomId);
    snesComparison = parsed.raw.equals(snesList.raw) ? 'exact' : 'modified';
    if (snesComparison === 'exact') exactSnesMatches++;
    else modifiedSnesRooms.push(roomId);
  }

  rooms.push(dungeonRoomEntry(roomId, source, parsed, snesComparison));
}

const result = {
  format: 'alttp-gba-dungeon-sprites-v1',
  source: dungeonSourceInfo(sources),
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

writeJsonArtifact(outPath, result);
console.log(JSON.stringify({ outPath, ...result.summary }, null, 2));
