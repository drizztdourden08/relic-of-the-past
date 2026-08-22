/* @layer shared-asset-extraction @kind data */
/**
 * Single source of truth for the GBA ALttP supplement's asset ORDER.
 *
 * The supplement container is read positionally by the C engine — an index is
 * "the Nth `assets.add*` call", nothing more — so the TS compiler
 * (`compile-resources-gba-alttp.ts`) and the C reader (`gba_alttp.c`) used to
 * each hand-maintain that ordering independently. Inserting or reordering an
 * entry in only one of them would silently desync the two: the engine would
 * keep reading index N as if it still meant the old asset, no error, just
 * wrong bytes.
 *
 * This manifest is the fix: the TS compiler iterates it to decide call order,
 * and `npm run generate:gba-asset-index` reads it to emit
 * `core/game-hooks/gba_asset_index.generated.h`, a C enum in the same order.
 * Add, remove or reorder an asset here and both sides move together.
 *
 * `name` is the exact string literal passed to `assets.add*` — it also
 * contributes to the container's key signature hash, so it must stay stable
 * for a given asset once shipped.
 */

interface GbaAlttpAssetManifestEntry {
  name: string;
  description: string;
}

const GBA_ALTTP_ASSET_MANIFEST: readonly GbaAlttpAssetManifestEntry[] = [
  { name: 'kGbaPalaceRoomIds', description: 'Native room id per palace room, in room order.' },
  { name: 'kGbaPalaceRoomHeaders', description: 'Raw room header bytes per palace room.' },
  { name: 'kGbaPalaceRoomLayersSnes', description: 'BG1/BG2/BG3 tilemap words per room, translated to SNES layout.' },
  { name: 'kGbaPalaceRoomCollision', description: 'Per-layer collision attribute bytes per room.' },
  { name: 'kGbaPalaceRoomInteractions', description: 'Per-room interactive cell list (water, pits, stairs, conveyors).' },
  { name: 'kGbaPalaceRoomEntities', description: 'Per-room native entity spawn list, sentinel-terminated.' },
  { name: 'kGbaPalaceRoomSecrets', description: 'Per-room native secret/item spawn list, sentinel-terminated.' },
  { name: 'kGbaPalaceBgGfxSnes4bpp', description: 'Background tile graphics, converted to SNES planar 4bpp.' },
  { name: 'kGbaPalacePaletteIds', description: 'Distinct background palette ids referenced by any palace room.' },
  { name: 'kGbaPalaceBgPalettes', description: 'Background palette color data, one entry per id above.' },
  { name: 'kGbaPalaceEnemyBlocksets', description: 'Enemy blockset id per sprite tileset.' },
  { name: 'kGbaPalaceSpriteTilesets', description: 'Sprite sheet id list per enemy tileset.' },
  { name: 'kGbaPalaceSpriteSheetIds', description: 'Native sheet id per extracted sprite sheet.' },
  { name: 'kGbaPalaceSpriteGfxSnes4bpp', description: 'Sprite tile graphics, converted to SNES planar 4bpp.' },
  { name: 'kGbaPalaceSpritePaletteBanks', description: 'OBJ palette bank index per extracted sprite palette.' },
  { name: 'kGbaPalaceSpritePalettes', description: 'Sprite palette color data (BGR555), one entry per bank above.' },
  { name: 'kGbaPalaceTileAttributes', description: 'Tile collision-attribute lookup table for the palace blockset.' },
  { name: 'kGbaPalaceTopology', description: 'Room-to-room connection edges (from, to, quadrant, door slot/hole).' },
  { name: 'kGbaAlttpTextIds', description: 'Native message id per dialogue entry.' },
  { name: 'kGbaAlttpTextNative', description: 'Raw native-encoded dialogue bytes, one entry per message.' },
  { name: 'kGbaAlttpTextPortUs', description: 'Re-encoded (US dialogue font) text, one entry per message.' },
  { name: 'kGbaAlttpEntityHandlerTypes', description: 'Entity handler type byte per entry in the handler table.' },
  { name: 'kGbaAlttpEntityHandlers', description: 'Entity handler THUMB entry-point addresses, packed as uint32.' },
  { name: 'kGbaAlttpRoomTagHandlerTags', description: 'Room tag byte per entry in the room-tag handler table.' },
  { name: 'kGbaAlttpRoomTagHandlers', description: 'Room-tag handler THUMB entry-point addresses, packed as uint32.' },
];

const GBA_ALTTP_ASSET_INDEX: Readonly<Record<string, number>> = Object.fromEntries(
  GBA_ALTTP_ASSET_MANIFEST.map((entry, index) => [entry.name, index]),
);

export { GBA_ALTTP_ASSET_MANIFEST, GBA_ALTTP_ASSET_INDEX };
export type { GbaAlttpAssetManifestEntry };
