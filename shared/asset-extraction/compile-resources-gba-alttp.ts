/* @layer shared-asset-extraction @kind logic */
import { AssetBuilder } from './asset-builder';
import type { DungeonEntityRecord, DungeonRoomRecord, NativeDungeonLayer } from './dungeon/model';
import type { GbaRomReader } from './rom/gba-rom';
import type { RomData } from './rom/rom-types';
import { compressStrings } from './text/dialogue-encoder';
import { EXTRA_DUNGEON_PALINFO } from './extensions/second-cartridge-palette';
import { doorListFor } from './extensions/second-cartridge-doors';
import { bankedRoomId } from './extensions/second-cartridge-bank';
import {
  AUX_TILE_THEME,
  GBA_ALTTP_ASSET_MANIFEST,
  assertBlocksetIdentity,
  compareSpriteSheets,
  GbaAlttpDungeonSource,
  extractDungeonPalette,
  extractDungeonSpriteGraphics,
  extractEntityHandlerTable,
  extractRoomTagHandlerTable,
  extractGbaAlttpText,
  extractPalaceSnes4bppTiles,
  extractPalaceSpritePalettes,
} from './sources/gba-alttp';

/**
 * Entity types the base engine has a handler for. The port added four of its own beyond this
 * (a gatekeeper, two quest actors and a marker) and dispatch is an indirect call through a
 * fixed table, so handing one to the engine is not a wrong enemy — it is a hard crash. They
 * are dropped until they have implementations, and the count is reported.
 */
const BASE_ENTITY_TYPE_COUNT = 243;

const supportedEntities = (room: DungeonRoomRecord): DungeonEntityRecord[] =>
  room.entities.filter(entity => entity.type < BASE_ENTITY_TYPE_COUNT);

const serializeEntityList = (room: DungeonRoomRecord): Buffer => Buffer.concat([
  Buffer.from([room.entitySortMode]),
  ...supportedEntities(room).map(entity => Buffer.from(entity.nativeBytes)),
  Buffer.from([0xff]),
]);

const serializeSecretList = (room: DungeonRoomRecord): Buffer => Buffer.concat([
  ...room.secrets.map(secret => Buffer.from(secret.nativeBytes)),
  Buffer.from([0xff, 0xff]),
]);

const uint32Buffer = (values: readonly number[]): Buffer => {
  const result = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => result.writeUInt32LE(value, index * 4));
  return result;
};

/**
 * The room header the engine reads, with the theme byte replaced.
 *
 * The port stores its own blockset id there; the engine reads that byte as
 * aux_tile_theme_index and loads graphics from it. The blockset is a base-game
 * blockset (see blockset-identity.ts), so writing its native index makes the engine
 * load the right sheets by itself.
 */
/**
 * Bit 0 of the first header byte, which the base game reads as "this room starts unlit".
 *
 * The cartridge sets it on five of these rooms including the dungeon's central hub — the room
 * seven others lead back into, and the one the guides describe as a large lit room with four
 * doorways. It renders pitch black if the bit is passed through, so whatever the cartridge
 * means by it, the base game's reading of it is wrong here. Cleared until it is understood;
 * the dungeon does have genuinely dark rooms, and they will need it back under whatever the
 * real condition turns out to be.
 */
const HEADER_LIGHTS_OUT = 0x01;

/** Header bytes 9 to 13: where a hole drops to, then the four staircase destinations. */
const FIRST_TRAVEL_BYTE = 9;
const LAST_TRAVEL_BYTE = 13;

/** A slot the cartridge trimmed away: no such exit exists in the room. */
const UNUSED_DESTINATION = 0x00;

/**
 * Fail the build if any exit leads out of this dungeon.
 *
 * A staircase or a hole sends the player to whatever room its header slot names, with no check
 * that the room has anything to do with this dungeon, so a misread destination teleports the
 * player somewhere unrelated instead of erroring. That is exactly what a fixed-width read of a
 * variable-length header used to produce: short records handed over the next room's bytes, and
 * two thirds of the slots named a room outside the dungeon — most often room 0, which the
 * cartridge means as "unused" and the engine reads as the base game's final boss room.
 *
 * A slot the cartridge never stored reads as zero and is never reached, because the room has no
 * such staircase to step on. Every slot that does carry a destination must name one of ours, so
 * anything else is a reader bug and is raised as one rather than quietly rewritten.
 */
const assertTravelStaysInDungeon = (bytes: Buffer, roomId: number, rooms: ReadonlySet<number>): void => {
  const stray: string[] = [];
  for (let at = FIRST_TRAVEL_BYTE; at <= LAST_TRAVEL_BYTE; at++) {
    if (bytes[at] !== UNUSED_DESTINATION && !rooms.has(bytes[at])) {
      stray.push(`byte ${at} -> 0x${bytes[at].toString(16)}`);
    }
  }
  if (stray.length > 0) {
    throw new Error(`Room 0x${roomId.toString(16)} travels outside the dungeon: ${stray.join(', ')}`);
  }
};

const nativeHeaderBytes = (room: DungeonRoomRecord, rooms: ReadonlySet<number>): Buffer => {
  const bytes = Buffer.from(room.header.nativeBytes);
  bytes[0] &= ~HEADER_LIGHTS_OUT;
  bytes[1] = EXTRA_DUNGEON_PALINFO;
  bytes[2] = AUX_TILE_THEME;
  assertTravelStaysInDungeon(bytes, room.id, rooms);
  return bytes;
};

/**
 * `streams` is the per-room object stream recovered by the stream solver — the engine's own
 * room format, solved from the cartridge's baked maps through the engine itself. It is an
 * input rather than computed here because solving needs a live engine instance, which the
 * caller hosts; this compile stays a pure synchronous function of its inputs.
 */
const compileGbaAlttpSupplement = (
  rom: GbaRomReader, snes: RomData, streams: ReadonlyMap<number, Buffer>,
): Buffer => {
  const source = new GbaAlttpDungeonSource(rom);
  const rooms = source.palaceRooms();
  const paletteIds = [...new Set(rooms.map(room => room.header.palette))].sort((a, b) => a - b);
  const spriteGraphics = extractDungeonSpriteGraphics(rom, rooms.map(room => room.header.enemyBlockset));
  const topology = source.palaceTopology();
  const text = extractGbaAlttpText(rom);
  const portText = compressStrings(text.map(message => message.plainText
    .replace(/\+ Control Pad/g, 'Control Pad')
    .replace(/:/g, ',')
    .replace(/\s+/g, ' ')
    .trim()), 'us');
  const handlers = extractEntityHandlerTable(rom);
  const roomTagHandlers = extractRoomTagHandlerTable(rom);
  const spritePalettes = extractPalaceSpritePalettes(rom);
  const roomIds: ReadonlySet<number> = new Set(rooms.map(room => room.id));
  const bgTiles = extractPalaceSnes4bppTiles(rom);
  // Fails the supplement — never the base game — if the blockset stops being a base-game one.
  assertBlocksetIdentity(snes, bgTiles);
  // The cartridge names its enemy sheets in the base game's own numbering — verified against
  // the three blocksets the base table also defines, where the two quartets are identical. So
  // what ships is the composition alone; the pixels are already in the base cartridge.
  const sheetMatches = compareSpriteSheets(snes, spriteGraphics.sheets);
  const matched = sheetMatches.filter(match => match.matchingTiles === 64).length;
  if (matched < sheetMatches.length / 2) {
    throw new Error(`Only ${matched} of ${sheetMatches.length} enemy sheets match the base sheet of the same id; the sheet numbering no longer holds`);
  }
  const assets = new AssetBuilder();

  // One builder per manifest entry, keyed by the asset's name. The MANIFEST —
  // not the order these are declared below — decides call order, so inserting
  // or reordering an asset only ever means editing asset-manifest.ts.
  const builders: Record<string, () => void> = {
    kGbaPalaceRoomIds: () => assets.addUint16('kGbaPalaceRoomIds', rooms.map(room => bankedRoomId(room.id))),
    kGbaPalaceRoomHeaders: () => assets.addPacked('kGbaPalaceRoomHeaders', rooms.map(room => nativeHeaderBytes(room, roomIds))),
    kGbaPalaceRoomEntities: () => assets.addPacked('kGbaPalaceRoomEntities', rooms.map(serializeEntityList)),
    kGbaPalaceRoomSecrets: () => assets.addPacked('kGbaPalaceRoomSecrets', rooms.map(serializeSecretList)),
    kGbaPalaceBgGfxSnes4bpp: () => assets.addUint8('kGbaPalaceBgGfxSnes4bpp', [...bgTiles]),
    kGbaPalacePaletteIds: () => assets.addUint8('kGbaPalacePaletteIds', paletteIds),
    kGbaPalaceBgPalettes: () => assets.addPacked('kGbaPalaceBgPalettes', rooms.map(room => extractDungeonPalette(rom, room.header.palette))),
    kGbaPalaceEnemyBlocksets: () => assets.addUint8('kGbaPalaceEnemyBlocksets', spriteGraphics.tilesets.map(tileset => tileset.enemyBlockset)),
    kGbaPalaceSpriteTilesets: () => assets.addPacked('kGbaPalaceSpriteTilesets',
      spriteGraphics.tilesets.map(tileset => Buffer.from(tileset.sheetIds))),
    kGbaPalaceSpriteSheetIds: () => assets.addUint8('kGbaPalaceSpriteSheetIds', spriteGraphics.sheets.map(sheet => sheet.id)),
    kGbaPalaceSpriteGfxSnes4bpp: () => assets.addPacked('kGbaPalaceSpriteGfxSnes4bpp', spriteGraphics.sheets.map(sheet => sheet.snes4bpp)),
    kGbaPalaceSpritePaletteBanks: () => assets.addUint8('kGbaPalaceSpritePaletteBanks', spritePalettes.map(palette => palette.bank)),
    kGbaPalaceSpritePalettes: () => assets.addPacked('kGbaPalaceSpritePalettes', spritePalettes.map(palette => palette.bgr555)),
    kGbaPalaceTileAttributes: () => assets.addUint8('kGbaPalaceTileAttributes', [...source.dungeonTileAttributes(rooms[0].header.blockset)]),
    kGbaPalaceTopology: () => assets.addUint16('kGbaPalaceTopology', topology.flatMap(edge => [
      bankedRoomId(edge.fromRoomId),
      bankedRoomId(edge.toRoomId),
      edge.quadrant,
      edge.kind === 'hole' ? 0 : edge.slot + 1,
    ])),
    kGbaAlttpTextIds: () => assets.addUint16('kGbaAlttpTextIds', text.map(message => message.id)),
    kGbaAlttpTextNative: () => assets.addPacked('kGbaAlttpTextNative', text.map(message => message.bytes)),
    kGbaAlttpTextPortUs: () => assets.addPacked('kGbaAlttpTextPortUs', portText.map(message => Buffer.from(message))),
    kGbaAlttpEntityHandlerTypes: () => assets.addUint8('kGbaAlttpEntityHandlerTypes', handlers.map(handler => handler.type)),
    kGbaAlttpEntityHandlers: () => assets.addUint8('kGbaAlttpEntityHandlers', [...uint32Buffer(handlers.map(handler => handler.thumbAddress))]),
    kGbaAlttpRoomTagHandlerTags: () => assets.addUint8('kGbaAlttpRoomTagHandlerTags', roomTagHandlers.map(handler => handler.tag)),
    kGbaPalaceRoomDoors: () => assets.addPacked('kGbaPalaceRoomDoors', rooms.map(room => doorListFor(room.id))),
    kGbaPalaceRoomLayouts: () => assets.addPacked('kGbaPalaceRoomLayouts', rooms.map(room => {
      const stream = streams.get(room.id);
      if (!stream || stream.length <= 2) throw new Error(`No solved stream for room 0x${room.id.toString(16)}`);
      return stream;
    })),
    kGbaAlttpRoomTagHandlers: () => assets.addUint8('kGbaAlttpRoomTagHandlers', [...uint32Buffer(roomTagHandlers.map(handler => handler.thumbAddress))]),
  };

  if (Object.keys(builders).length !== GBA_ALTTP_ASSET_MANIFEST.length) {
    throw new Error('compileGbaAlttpSupplement: builders and asset-manifest.ts have drifted apart (count mismatch)');
  }
  for (const entry of GBA_ALTTP_ASSET_MANIFEST) {
    const build = builders[entry.name];
    if (!build) throw new Error(`compileGbaAlttpSupplement: no builder registered for manifest entry "${entry.name}"`);
    build();
  }

  return assets.serialize();
};

export { compileGbaAlttpSupplement };
