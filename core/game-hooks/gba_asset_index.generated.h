/* @layer core-game-hooks @kind generated */
/**
 * GENERATED — do not hand-edit. Regenerate with `npm run generate:gba-asset-index`
 * (scripts/generate-gba-asset-index.mjs), which reads
 * shared/asset-extraction/sources/gba-alttp/asset-manifest.ts and emits one
 * enum member per GBA ALttP supplement asset, in manifest order.
 */
#ifndef ZELDA3_GBA_ASSET_INDEX_GENERATED_H_
#define ZELDA3_GBA_ASSET_INDEX_GENERATED_H_

enum {
  kGbaAssetRoomIds = 0,  // kGbaPalaceRoomIds — Native room id per palace room, in room order.
  kGbaAssetRoomHeaders,  // kGbaPalaceRoomHeaders — Raw room header bytes per palace room.
  kGbaAssetRoomEntities,  // kGbaPalaceRoomEntities — Per-room native entity spawn list, sentinel-terminated.
  kGbaAssetRoomSecrets,  // kGbaPalaceRoomSecrets — Per-room native secret/item spawn list, sentinel-terminated.
  kGbaAssetBgGfxSnes4bpp,  // kGbaPalaceBgGfxSnes4bpp — Background tile graphics, converted to SNES planar 4bpp.
  kGbaAssetPaletteIds,  // kGbaPalacePaletteIds — Distinct background palette ids referenced by any palace room.
  kGbaAssetBgPalettes,  // kGbaPalaceBgPalettes — Background palette color data, one entry per id above.
  kGbaAssetEnemyBlocksets,  // kGbaPalaceEnemyBlocksets — Enemy blockset id per sprite tileset.
  kGbaAssetSpriteTilesets,  // kGbaPalaceSpriteTilesets — Sprite sheet id list per enemy tileset.
  kGbaAssetSpriteSheetIds,  // kGbaPalaceSpriteSheetIds — Native sheet id per extracted sprite sheet.
  kGbaAssetSpriteGfxSnes4bpp,  // kGbaPalaceSpriteGfxSnes4bpp — Sprite tile graphics, converted to SNES planar 4bpp.
  kGbaAssetSpritePaletteBanks,  // kGbaPalaceSpritePaletteBanks — OBJ palette bank index per extracted sprite palette.
  kGbaAssetSpritePalettes,  // kGbaPalaceSpritePalettes — Sprite palette color data (BGR555), one entry per bank above.
  kGbaAssetTileAttributes,  // kGbaPalaceTileAttributes — Tile collision-attribute lookup table for the palace blockset.
  kGbaAssetTopology,  // kGbaPalaceTopology — Room-to-room connection edges (from, to, quadrant, door slot/hole).
  kGbaAssetTextIds,  // kGbaAlttpTextIds — Native message id per dialogue entry.
  kGbaAssetTextNative,  // kGbaAlttpTextNative — Raw native-encoded dialogue bytes, one entry per message.
  kGbaAssetTextPortUs,  // kGbaAlttpTextPortUs — Re-encoded (US dialogue font) text, one entry per message.
  kGbaAssetEntityHandlerTypes,  // kGbaAlttpEntityHandlerTypes — Entity handler type byte per entry in the handler table.
  kGbaAssetEntityHandlers,  // kGbaAlttpEntityHandlers — Entity handler THUMB entry-point addresses, packed as uint32.
  kGbaAssetRoomTagHandlerTags,  // kGbaAlttpRoomTagHandlerTags — Room tag byte per entry in the room-tag handler table.
  kGbaAssetRoomTagHandlers,  // kGbaAlttpRoomTagHandlers — Room-tag handler THUMB entry-point addresses, packed as uint32.
  kGbaAssetRoomDoors,  // kGbaPalaceRoomDoors — Per-room native door records, sentinel-terminated.
  kGbaAssetCameraBounds,  // kGbaPalaceCameraBounds — Per-room camera pin: flags word, then camera min and max X, for rooms whose baked sides are padding.
  kGbaAssetRoomLayersSnes,  // kGbaPalaceRoomLayersSnes — Baked tilemap words per room layer (three layers per room), translated to SNES layout.
  kGbaAssetRoomCollision,  // kGbaPalaceRoomCollision — Per-layer collision attribute bytes per room, as the port ships them.
  kGbaAssetAttrOverlays,  // kGbaPalaceAttrOverlays — Per-room attribute corrections applied after collision installs: layer, cell, attribute records.
  kGbaAssetTileAttrOverrides,  // kGbaPalaceTileAttrOverrides — Per-tile attribute corrections for ids the port re-drew: tile word, attribute byte records.
  kGbaAssetObjPalettes,  // kGbaPalaceObjPalettes — Hardware-captured sprite palette rows: row byte then sixteen BGR555 colors per record.
  kGbaAssetAnimatedTiles,  // kGbaPalaceAnimatedTiles — Hardware-captured animated background tiles: three frames of 32 tiles, in cycle order.
  kGbaAssetTorches,  // kGbaPalaceTorches — The dungeon's lightable-torch entries, appended to the engine's torch table: room, positions, terminator.
  kGbaAlttpAssetCount,
};

#endif  // ZELDA3_GBA_ASSET_INDEX_GENERATED_H_
