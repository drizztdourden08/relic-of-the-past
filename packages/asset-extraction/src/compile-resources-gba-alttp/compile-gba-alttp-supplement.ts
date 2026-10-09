/* @layer shared-asset-extraction @kind logic */
import { AssetBuilder } from '../asset-builder';
import type { GbaRomReader } from '../rom/gba-rom';
import type { RomData } from '../rom/rom-types';
import { doorListFor } from '../extensions/second-cartridge-doors';
import { attrOverlayRecord, tileAttrOverridesRecord } from '../extensions/second-cartridge-attrs';
import { objPaletteRecords } from '../extensions/second-cartridge-palettes';
import { ANIMATED_TILES_GBA_4BPP } from '../extensions/second-cartridge-animated-tiles';
import { convertGbaSheetToSnes4bpp } from '../graphics/gba-native';
import { bankedRoomId } from '../extensions/second-cartridge-bank';
import { torchTableRecord } from '../extensions/second-cartridge-torches';
import {
  GBA_ALTTP_ASSET_MANIFEST,
  assertBlocksetIdentity,
  GbaAlttpDungeonSource,
  extractDungeonSpriteGraphics,
  extractEntityHandlerTable,
  extractRoomTagHandlerTable,
  extractGbaAlttpText,
  extractPalaceSnes4bppTiles,
  extractPalaceSpritePalettes,
} from '../sources/gba-alttp';
import { assertEnemySheetNumbering } from './assert-enemy-sheet-numbering';
import { encodePortText } from './encode-port-text';
import { nativeHeaderBytes } from './native-header-bytes';
import { roomLayersWithOccludersOnTop } from './room-layers-with-occluders-on-top';
import { roomMajorLayerBuffers } from './room-major-layer-buffers';
import { roomPaletteRecord } from './room-palette-record';
import { serializeEntityList } from './serialize-entity-list';
import { serializeSecretList } from './serialize-secret-list';
import { uint32Buffer } from './uint32-buffer';

const compileGbaAlttpSupplement = (rom: GbaRomReader, snes: RomData): Buffer => {
  const source = new GbaAlttpDungeonSource(rom);
  const rooms = source.palaceRooms();
  const paletteIds = [...new Set(rooms.map(room => room.header.palette))].sort((a, b) => a - b);
  const spriteGraphics = extractDungeonSpriteGraphics(rom, rooms.map(room => room.header.enemyBlockset));
  const topology = source.palaceTopology();
  const text = extractGbaAlttpText(rom);
  const portText = encodePortText(text.map(message => message.plainText));
  const handlers = extractEntityHandlerTable(rom);
  const roomTagHandlers = extractRoomTagHandlerTable(rom);
  const spritePalettes = extractPalaceSpritePalettes(rom);
  const roomIds: ReadonlySet<number> = new Set(rooms.map(room => room.id));
  const bgTiles = extractPalaceSnes4bppTiles(rom);
  assertBlocksetIdentity(snes, bgTiles);
  assertEnemySheetNumbering(snes, spriteGraphics.sheets);
  const assets = new AssetBuilder();

  const builders: Record<string, () => void> = {
    kGbaPalaceRoomIds: () => assets.addUint16('kGbaPalaceRoomIds', rooms.map(room => bankedRoomId(room.id))),
    kGbaPalaceRoomHeaders: () => assets.addPacked('kGbaPalaceRoomHeaders', rooms.map(room => nativeHeaderBytes(room, roomIds))),
    kGbaPalaceRoomEntities: () => assets.addPacked('kGbaPalaceRoomEntities', rooms.map(serializeEntityList)),
    kGbaPalaceRoomSecrets: () => assets.addPacked('kGbaPalaceRoomSecrets', rooms.map(serializeSecretList)),
    kGbaPalaceBgGfxSnes4bpp: () => assets.addUint8('kGbaPalaceBgGfxSnes4bpp', [...bgTiles]),
    kGbaPalacePaletteIds: () => assets.addUint8('kGbaPalacePaletteIds', paletteIds),
    kGbaPalaceBgPalettes: () => assets.addPacked('kGbaPalaceBgPalettes', rooms.map(room => roomPaletteRecord(rom, room, rooms))),
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
    kGbaAlttpRoomTagHandlers: () => assets.addUint8('kGbaAlttpRoomTagHandlers', [...uint32Buffer(roomTagHandlers.map(handler => handler.thumbAddress))]),
    kGbaPalaceCameraBounds: () => assets.addPacked('kGbaPalaceCameraBounds', rooms.map(() => Buffer.alloc(0))),
    kGbaPalaceRoomLayersSnes: () => assets.addPacked('kGbaPalaceRoomLayersSnes', rooms.flatMap(roomLayersWithOccludersOnTop)),
    kGbaPalaceRoomCollision: () => assets.addPacked('kGbaPalaceRoomCollision', roomMajorLayerBuffers(rooms, layer => Buffer.from(layer.collision))),
    kGbaPalaceAttrOverlays: () => assets.addPacked('kGbaPalaceAttrOverlays', rooms.map(room => attrOverlayRecord(room))),
    kGbaPalaceTileAttrOverrides: () => assets.addUint8('kGbaPalaceTileAttrOverrides', [...tileAttrOverridesRecord()]),
    kGbaPalaceObjPalettes: () => assets.addUint8('kGbaPalaceObjPalettes', [...objPaletteRecords()]),
    kGbaPalaceAnimatedTiles: () => assets.addUint8('kGbaPalaceAnimatedTiles',
      [...convertGbaSheetToSnes4bpp(ANIMATED_TILES_GBA_4BPP)]),
    kGbaPalaceTorches: () => assets.addUint8('kGbaPalaceTorches',
      [...torchTableRecord(rom, snes, new Set(rooms.map(room => room.id)))]),
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
