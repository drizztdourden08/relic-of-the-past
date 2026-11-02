#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { resolve } from 'node:path';
import { hashBuffer } from './lib/common.mjs';
import { decodeDungeonLayers } from './lib/decode-dungeon-layers.mjs';
import { dungeonListJson } from './lib/dungeon-list-json.mjs';
import { parseDungeonRoomHeader } from './lib/dungeon-room-header.mjs';
import { parseDungeonSecretList } from './lib/dungeon-secrets.mjs';
import { parseDungeonSpriteList } from './lib/dungeon-sprites.mjs';
import { formatGbaPointer, readGbaRoomPointer } from './lib/gba-room-pointer.mjs';
import { loadRoomRom } from './lib/load-room-rom.mjs';
import { writeJsonArtifact } from './lib/write-json-artifact.mjs';

const HEADER_TABLE = 0x164020;
const SECRET_TABLE = 0x2264c8;
const SPRITE_TABLE = 0x228df0;

const { args, roomId, romPath, rom } = loadRoomRom();

const headerSource = readGbaRoomPointer(rom, HEADER_TABLE, roomId);
const secretSource = readGbaRoomPointer(rom, SECRET_TABLE, roomId);
const spriteSource = readGbaRoomPointer(rom, SPRITE_TABLE, roomId);
const header = parseDungeonRoomHeader(rom, headerSource.offset);
const secrets = parseDungeonSecretList(rom, secretSource.offset);
const sprites = parseDungeonSpriteList(rom, spriteSource.offset, roomId);
const layers = decodeDungeonLayers(rom, roomId).map(decoded => ({
  layer: decoded.layer,
  source: formatGbaPointer(decoded.source),
  compressedSize: decoded.compressedSize,
  rawHex: decoded.raw.toString('hex'),
  ...decoded.map,
}));

const outPath = resolve(args.out ?? `tooling/gba-alttp-re/artifacts/room-${roomId.toString(16).padStart(3, '0')}.json`);
const result = {
  format: 'alttp-gba-dungeon-room-v1',
  source: { romPath, sha256: hashBuffer(rom, 'sha256') },
  roomId,
  header: {
    source: formatGbaPointer(headerSource),
    ...header,
    raw: undefined,
    rawHex: header.raw.toString('hex'),
  },
  layers,
  sprites: dungeonListJson(spriteSource, sprites),
  secrets: dungeonListJson(secretSource, secrets),
};

writeJsonArtifact(outPath, result);
console.log(JSON.stringify({
  outPath,
  roomId,
  header: result.header,
  layerPointers: result.layers.map(layer => layer.source.address),
  spriteCount: result.sprites.records.length,
  secretCount: result.secrets.records.length,
}, null, 2));
