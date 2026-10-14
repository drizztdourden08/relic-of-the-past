/* @layer shared-asset-extraction @kind logic */
import { attrOverlayRecord, tileAttrOverridesRecord } from '../../extensions/second-cartridge-attrs';
import { objPaletteRecords } from '../../extensions/second-cartridge-palettes';
import { ANIMATED_TILES_GBA_4BPP } from '../../extensions/second-cartridge-animated-tiles';
import { convertGbaSheetToSnes4bpp } from '../../graphics/gba-native';
import { torchTableRecord } from '../../extensions/second-cartridge-torches';
import { roomLayersWithOccludersOnTop } from '../room-layers-with-occluders-on-top';
import { roomMajorLayerBuffers } from '../room-major-layer-buffers';
import type { SupplementBuilders, SupplementContext } from './supplement-builders.type';

const graphicsBuilders = (context: SupplementContext): SupplementBuilders => {
  const { rom, snes, assets, rooms, spriteGraphics, spritePalettes } = context;
  return {
    kGbaPalaceEnemyBlocksets: () => assets.addUint8('kGbaPalaceEnemyBlocksets', spriteGraphics.tilesets.map(tileset => tileset.enemyBlockset)),
    kGbaPalaceSpriteTilesets: () => assets.addPacked('kGbaPalaceSpriteTilesets',
      spriteGraphics.tilesets.map(tileset => Buffer.from(tileset.sheetIds))),
    kGbaPalaceSpriteSheetIds: () => assets.addUint8('kGbaPalaceSpriteSheetIds', spriteGraphics.sheets.map(sheet => sheet.id)),
    kGbaPalaceSpriteGfxSnes4bpp: () => assets.addPacked('kGbaPalaceSpriteGfxSnes4bpp', spriteGraphics.sheets.map(sheet => sheet.snes4bpp)),
    kGbaPalaceSpritePaletteBanks: () => assets.addUint8('kGbaPalaceSpritePaletteBanks', spritePalettes.map(palette => palette.bank)),
    kGbaPalaceSpritePalettes: () => assets.addPacked('kGbaPalaceSpritePalettes', spritePalettes.map(palette => palette.bgr555)),
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
};

export { graphicsBuilders };
