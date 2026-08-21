#!/usr/bin/env node
/* @layer scripts @kind tooling */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { PNG } from 'pngjs';
import { compileGbaAlttpSupplement } from '../../shared/asset-extraction/compile-resources-gba-alttp';
import { decode4bppTile } from '../../shared/asset-extraction/graphics/bitplane-decoder';
import { loadGbaAlttpRomFromBuffer } from '../../shared/asset-extraction/rom/gba-rom';
import {
  GbaAlttpDungeonSource,
  GBA_NEW_ENTITY_HANDLERS,
  PALACE_AUDIO_REFERENCES,
  PALACE_BEHAVIOR_SPECS,
  PALACE_ROOM_IDS,
  PALACE_BOSS_ROOMS,
  PALACE_ENTITY_TYPES,
  PALACE_PROGRESSION_ANCHORS,
  PALACE_ROOM_TAGS,
  extractDungeonPalette,
  extractDungeonSpriteGraphics,
  extractEntityHandlerTable,
  extractRoomTagHandlerTable,
  extractGbaAlttpText,
  extractPalaceSnes4bppTiles,
  extractPalaceSpritePalettes,
  decodeGbaAlttpSaveProgression,
} from '../../shared/asset-extraction/sources/gba-alttp';

interface CliArguments {
  rom?: string;
  out?: string;
  'allow-unknown-rom'?: boolean;
}

const parseArguments = (): CliArguments => {
  const result: CliArguments = {};
  const values = process.argv.slice(2);
  for (let i = 0; i < values.length; i++) {
    const key = values[i];
    if (!key.startsWith('--')) throw new Error(`Unexpected argument: ${key}`);
    if (key === '--allow-unknown-rom') {
      result['allow-unknown-rom'] = true;
      continue;
    }
    const value = values[++i];
    if (!value) throw new Error(`Missing value for ${key}`);
    if (key === '--rom') result.rom = value;
    else if (key === '--out') result.out = value;
    else throw new Error(`Unknown argument: ${key}`);
  }
  return result;
};

const wordsToBuffer = (words: Uint16Array): Buffer => {
  const result = Buffer.alloc(words.length * 2);
  for (let i = 0; i < words.length; i++) result.writeUInt16LE(words[i], i * 2);
  return result;
};

const entityBytes = (sortMode: number, records: readonly { nativeBytes: Uint8Array }[]): Buffer => Buffer.concat([
  Buffer.from([sortMode]),
  ...records.map(record => Buffer.from(record.nativeBytes)),
  Buffer.from([0xff]),
]);

const secretBytes = (records: readonly { nativeBytes: Uint8Array }[]): Buffer => Buffer.concat([
  ...records.map(record => Buffer.from(record.nativeBytes)),
  Buffer.from([0xff, 0xff]),
]);

const decodeColor = (value: number): readonly [number, number, number, number] => [
  Math.round((value & 0x1f) * 255 / 31),
  Math.round(((value >>> 5) & 0x1f) * 255 / 31),
  Math.round(((value >>> 10) & 0x1f) * 255 / 31),
  0xff,
];

const renderRoom = (
  layers: readonly { snesWords: Uint16Array }[],
  graphics: Buffer,
  palette: Buffer,
): Buffer => {
  const width = 512;
  const png = new PNG({ width, height: 512 });
  const tiles = Array.from({ length: 512 }, (_, index) => decode4bppTile(graphics, index * 32));
  const colors = Array.from({ length: 8 }, (_, bank) => Array.from({ length: 16 }, (_, color) => {
    if (bank < 2) return [0, 0, 0, 0] as const;
    return decodeColor(palette.readUInt16LE((bank - 2) * 32 + color * 2));
  }));

  for (const layer of layers) {
    for (let tileY = 0; tileY < 64; tileY++) {
      for (let tileX = 0; tileX < 64; tileX++) {
        const word = layer.snesWords[tileY * 64 + tileX];
        const tile = tiles[word & 0x03ff];
        const bank = (word >>> 10) & 7;
        const horizontalFlip = Boolean(word & 0x4000);
        const verticalFlip = Boolean(word & 0x8000);
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const sourceX = horizontalFlip ? 7 - x : x;
            const sourceY = verticalFlip ? 7 - y : y;
            const colorIndex = tile[sourceY * 8 + sourceX];
            if (colorIndex === 0 || bank < 2) continue;
            const color = colors[bank][colorIndex];
            const destination = ((tileY * 8 + y) * width + tileX * 8 + x) * 4;
            png.data[destination] = color[0];
            png.data[destination + 1] = color[1];
            png.data[destination + 2] = color[2];
            png.data[destination + 3] = color[3];
          }
        }
      }
    }
  }
  return PNG.sync.write(png);
};

const renderCollision = (collision: Uint8Array): Buffer => {
  const png = new PNG({ width: 512, height: 512 });
  for (let tileY = 0; tileY < 64; tileY++) {
    for (let tileX = 0; tileX < 64; tileX++) {
      const attribute = collision[tileY * 64 + tileX];
      const red = (attribute * 73) & 0xff;
      const green = (attribute * 151) & 0xff;
      const blue = (attribute * 211) & 0xff;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const destination = ((tileY * 8 + y) * 512 + tileX * 8 + x) * 4;
          png.data[destination] = red;
          png.data[destination + 1] = green;
          png.data[destination + 2] = blue;
          png.data[destination + 3] = 0xff;
        }
      }
    }
  }
  return PNG.sync.write(png);
};

const args = parseArguments();
const defaultRom = resolve('test-roms/Legend of Zelda, The - A Link to the Past & Four Swords (USA).gba');
const romPath = resolve(args.rom ?? defaultRom);
const outputRoot = resolve(args.out ?? 'debug-output/gba-alttp-palace');
const romBytes = readFileSync(romPath);
const rom = loadGbaAlttpRomFromBuffer(romBytes, { allowUnknownHash: args['allow-unknown-rom'] });
const source = new GbaAlttpDungeonSource(rom);
const rooms = source.palaceRooms();
const graphics = extractPalaceSnes4bppTiles(rom);
const spriteGraphics = extractDungeonSpriteGraphics(rom, rooms.map(room => room.header.enemyBlockset));
const spritePalettes = extractPalaceSpritePalettes(rom);
const text = extractGbaAlttpText(rom);
const handlers = extractEntityHandlerTable(rom);
const roomTagHandlers = extractRoomTagHandlerTable(rom);
const destinationCandidates = source.palaceTopology();
const paletteIds = [...new Set(rooms.map(room => room.header.palette))].sort((a, b) => a - b);

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });
mkdirSync(resolve(outputRoot, 'graphics'), { recursive: true });
mkdirSync(resolve(outputRoot, 'graphics', 'sprites'), { recursive: true });
mkdirSync(resolve(outputRoot, 'dialogue'), { recursive: true });
writeFileSync(resolve(outputRoot, 'palace-assets.dat'), compileGbaAlttpSupplement(rom));
writeFileSync(resolve(outputRoot, 'graphics', 'palace-bg.snes-4bpp'), graphics);
for (const sheet of spriteGraphics.sheets) {
  writeFileSync(resolve(outputRoot, 'graphics', 'sprites', `sheet-${sheet.id.toString(16).padStart(2, '0')}.snes-4bpp`), sheet.snes4bpp);
}
for (const palette of spritePalettes) {
  writeFileSync(resolve(outputRoot, 'graphics', 'sprites', `palette-bank-${palette.bank}.bgr555`), palette.bgr555);
}
for (const message of text) {
  const id = message.id.toString(16).padStart(3, '0');
  writeFileSync(resolve(outputRoot, 'dialogue', `${id}.native.bin`), message.bytes);
}
writeFileSync(resolve(outputRoot, 'dialogue', 'messages.json'), `${JSON.stringify(text.map(message => ({
  id: message.id,
  idHex: `0x${message.id.toString(16).padStart(3, '0')}`,
  sourceAddress: `0x${message.address.toString(16).padStart(8, '0')}`,
  text: message.plainText,
})), null, 2)}\n`);

const defaultSave = romPath.replace(/\.gba$/i, '.sav');
const progression = existsSync(defaultSave) ? decodeGbaAlttpSaveProgression(readFileSync(defaultSave)) : null;
if (progression) writeFileSync(resolve(outputRoot, 'progression.json'), `${JSON.stringify(progression, null, 2)}\n`);

for (const paletteId of paletteIds) {
  const path = resolve(outputRoot, 'palettes', `dungeon-${paletteId.toString(16).padStart(2, '0')}.bgr555`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, extractDungeonPalette(rom, paletteId));
}

for (const room of rooms) {
  const roomName = `room-${room.id.toString(16).padStart(3, '0')}`;
  const roomRoot = resolve(outputRoot, 'rooms', roomName);
  mkdirSync(roomRoot, { recursive: true });
  writeFileSync(resolve(roomRoot, 'header.snes-native.bin'), room.header.nativeBytes);
  writeFileSync(resolve(roomRoot, 'entities.snes-native.bin'), entityBytes(room.entitySortMode, room.entities));
  writeFileSync(resolve(roomRoot, 'secrets.snes-native.bin'), secretBytes(room.secrets));
  room.layers.forEach((layer, index) => {
    writeFileSync(resolve(roomRoot, `layer-${index + 1}.snes-tilemap.bin`), wordsToBuffer(layer.snesWords));
    writeFileSync(resolve(roomRoot, `layer-${index + 1}.collision.bin`), layer.collision);
    writeFileSync(resolve(roomRoot, `layer-${index + 1}.collision.png`), renderCollision(layer.collision));
  });
  const palette = extractDungeonPalette(rom, room.header.palette);
  writeFileSync(resolve(roomRoot, 'preview.png'), renderRoom(room.layers, graphics, palette));
}

const manifest = {
  format: 'relic-of-the-past-gba-alttp-supplement-v1',
  source: {
    sha256: createHash('sha256').update(romBytes).digest('hex'),
    title: romBytes.subarray(0xa0, 0xac).toString('ascii').replace(/\0+$/, ''),
  },
  conversion: {
    tilemaps: 'SNES 16-bit VRAM tilemap words (tile/palette/priority/hflip/vflip)',
    graphics: 'SNES planar 4bpp, 32 bytes per 8x8 tile',
    palettes: 'SNES/GBA-compatible little-endian BGR555',
    headers: '14-byte ALttP native dungeon header',
    entities: 'ALttP native 3-byte records with sort byte and 0xff terminator',
    secrets: 'ALttP native 3-byte records with 0xffff terminator',
    collision: 'ALttP native per-tile attribute bytes with directional flip bits applied',
  },
  runtimeAnchors: {
    linkCoordinates: ['0x030038F0', '0x030038F4'],
    entityCoordinateArrays: '0x03003102..0x03003132',
    riddleQuestState: '0x03003182',
    palaceAccessState: '0x030031D8',
    swordPieceState: '0x030038E3',
    entityDamageRoutine: '0x080C2160',
    dropRoutine: '0x080C6A10',
    dropTable: '0x0817217A',
  },
  behaviorInventory: {
    modifiedBossRooms: PALACE_BOSS_ROOMS,
    entityTypes: PALACE_ENTITY_TYPES,
    newEntityHandlers: GBA_NEW_ENTITY_HANDLERS,
    palaceRoomTags: PALACE_ROOM_TAGS,
    specifications: PALACE_BEHAVIOR_SPECS,
    roomTagHandlerTable: '0x08152AC4',
    caveat: 'Machine-code addresses are provenance anchors, not portable behavior. These handlers and boss room branches require semantic C ports.',
  },
  dialogue: {
    count: text.length,
    exclusiveRange: ['0x195', '0x1C6'],
    palaceGatekeeper: ['0x1A5', '0x1A6'],
    riddleAndHurricaneSpin: ['0x1A8', '0x1C6'],
  },
  progression,
  progressionAnchors: PALACE_PROGRESSION_ANCHORS,
  audioReferences: {
    ids: PALACE_AUDIO_REFERENCES,
    policy: 'Map semantic effects to the port sound bank; do not copy GBA audio-engine data into the SNES-derived runtime.',
  },
  destinationCandidates,
  entityHandlers: {
    table: '0x08174148',
    entries: handlers.map(handler => ({
      type: handler.type,
      address: `0x${handler.thumbAddress.toString(16).padStart(8, '0')}`,
    })),
  },
  roomTagHandlers: roomTagHandlers.map(handler => ({
    tag: handler.tag,
    tagHex: `0x${handler.tag.toString(16).padStart(2, '0')}`,
    address: `0x${handler.thumbAddress.toString(16).padStart(8, '0')}`,
  })),
  spriteGraphics: {
    pointerTable: '0x0822B314',
    tilesetTable: '0x0822B624',
    unchangedSlot: 0xff,
    tilesets: spriteGraphics.tilesets.map(tileset => ({
      enemyBlockset: tileset.enemyBlockset,
      tilesetIndex: tileset.tilesetIndex,
      sheetIds: tileset.sheetIds,
    })),
    sheets: spriteGraphics.sheets.map(sheet => ({
      id: sheet.id,
      sourceAddress: `0x${sheet.sourceAddress.toString(16).padStart(8, '0')}`,
    })),
    palettes: spritePalettes.map(palette => ({
      bank: palette.bank,
      sourceAddress: `0x${palette.address.toString(16).padStart(8, '0')}`,
    })),
  },
  roomIds: [...PALACE_ROOM_IDS],
  rooms: rooms.map(room => ({
    id: room.id,
    idHex: `0x${room.id.toString(16).padStart(3, '0')}`,
    palette: room.header.palette,
    blockset: room.header.blockset,
    enemyBlockset: room.header.enemyBlockset,
    tags: room.header.tags,
    entityTypes: room.entities.map(entity => entity.type),
    entityCount: room.entities.length,
    secretCount: room.secrets.length,
    interactions: source.roomInteractions(room),
    provenance: room.provenance,
  })),
};
writeFileSync(resolve(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Extracted ${rooms.length} Palace rooms to ${outputRoot}`);
