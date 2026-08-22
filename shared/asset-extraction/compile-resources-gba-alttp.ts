/* @layer shared-asset-extraction @kind logic */
import { AssetBuilder } from './asset-builder';
import type { DungeonRoomRecord, NativeDungeonLayer } from './dungeon/model';
import type { GbaRomReader } from './rom/gba-rom';
import { compressStrings } from './text/dialogue-encoder';
import {
  GBA_ALTTP_ASSET_MANIFEST,
  GbaAlttpDungeonSource,
  extractDungeonPalette,
  extractDungeonSpriteGraphics,
  extractEntityHandlerTable,
  extractRoomTagHandlerTable,
  extractGbaAlttpText,
  extractPalaceSnes4bppTiles,
  extractPalaceSpritePalettes,
} from './sources/gba-alttp';

const wordsToBuffer = (words: Uint16Array): Buffer => {
  const result = Buffer.alloc(words.length * 2);
  for (let i = 0; i < words.length; i++) result.writeUInt16LE(words[i], i * 2);
  return result;
};

const serializeEntityList = (room: DungeonRoomRecord): Buffer => Buffer.concat([
  Buffer.from([room.entitySortMode]),
  ...room.entities.map(entity => Buffer.from(entity.nativeBytes)),
  Buffer.from([0xff]),
]);

const serializeSecretList = (room: DungeonRoomRecord): Buffer => Buffer.concat([
  ...room.secrets.map(secret => Buffer.from(secret.nativeBytes)),
  Buffer.from([0xff, 0xff]),
]);

const layerBuffers = (rooms: readonly DungeonRoomRecord[], select: (layer: NativeDungeonLayer) => Buffer): Buffer[] => {
  const result: Buffer[] = [];
  for (const room of rooms) for (const layer of room.layers) result.push(select(layer));
  return result;
};

const uint32Buffer = (values: readonly number[]): Buffer => {
  const result = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => result.writeUInt32LE(value, index * 4));
  return result;
};

const INTERACTION_KIND_IDS = {
  'deep-water': 1,
  'shallow-water': 2,
  pit: 3,
  stair: 4,
  'conveyor-up': 5,
  'conveyor-down': 6,
  'conveyor-left': 7,
  'conveyor-right': 8,
} as const;

const compileGbaAlttpSupplement = (rom: GbaRomReader): Buffer => {
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
  const assets = new AssetBuilder();

  // One builder per manifest entry, keyed by the asset's name. The MANIFEST —
  // not the order these are declared below — decides call order, so inserting
  // or reordering an asset only ever means editing asset-manifest.ts.
  const builders: Record<string, () => void> = {
    kGbaPalaceRoomIds: () => assets.addUint16('kGbaPalaceRoomIds', rooms.map(room => room.id)),
    kGbaPalaceRoomHeaders: () => assets.addPacked('kGbaPalaceRoomHeaders', rooms.map(room => Buffer.from(room.header.nativeBytes))),
    kGbaPalaceRoomLayersSnes: () => assets.addPacked('kGbaPalaceRoomLayersSnes', layerBuffers(rooms, layer => wordsToBuffer(layer.snesWords))),
    kGbaPalaceRoomCollision: () => assets.addPacked('kGbaPalaceRoomCollision', layerBuffers(rooms, layer => Buffer.from(layer.collision))),
    kGbaPalaceRoomInteractions: () => assets.addPacked('kGbaPalaceRoomInteractions', rooms.map(room => Buffer.concat([
      ...source.roomInteractions(room).map(cell => Buffer.from([
        cell.layer,
        cell.x,
        cell.y,
        cell.attribute,
        INTERACTION_KIND_IDS[cell.kind],
      ])),
      Buffer.from([0xff]),
    ]))),
    kGbaPalaceRoomEntities: () => assets.addPacked('kGbaPalaceRoomEntities', rooms.map(serializeEntityList)),
    kGbaPalaceRoomSecrets: () => assets.addPacked('kGbaPalaceRoomSecrets', rooms.map(serializeSecretList)),
    kGbaPalaceBgGfxSnes4bpp: () => assets.addUint8('kGbaPalaceBgGfxSnes4bpp', [...extractPalaceSnes4bppTiles(rom)]),
    kGbaPalacePaletteIds: () => assets.addUint8('kGbaPalacePaletteIds', paletteIds),
    kGbaPalaceBgPalettes: () => assets.addPacked('kGbaPalaceBgPalettes', paletteIds.map(id => extractDungeonPalette(rom, id))),
    kGbaPalaceEnemyBlocksets: () => assets.addUint8('kGbaPalaceEnemyBlocksets', spriteGraphics.tilesets.map(tileset => tileset.enemyBlockset)),
    kGbaPalaceSpriteTilesets: () => assets.addPacked('kGbaPalaceSpriteTilesets', spriteGraphics.tilesets.map(tileset => Buffer.from(tileset.sheetIds))),
    kGbaPalaceSpriteSheetIds: () => assets.addUint8('kGbaPalaceSpriteSheetIds', spriteGraphics.sheets.map(sheet => sheet.id)),
    kGbaPalaceSpriteGfxSnes4bpp: () => assets.addPacked('kGbaPalaceSpriteGfxSnes4bpp', spriteGraphics.sheets.map(sheet => sheet.snes4bpp)),
    kGbaPalaceSpritePaletteBanks: () => assets.addUint8('kGbaPalaceSpritePaletteBanks', spritePalettes.map(palette => palette.bank)),
    kGbaPalaceSpritePalettes: () => assets.addPacked('kGbaPalaceSpritePalettes', spritePalettes.map(palette => palette.bgr555)),
    kGbaPalaceTileAttributes: () => assets.addUint8('kGbaPalaceTileAttributes', [...source.dungeonTileAttributes(rooms[0].header.blockset)]),
    kGbaPalaceTopology: () => assets.addUint16('kGbaPalaceTopology', topology.flatMap(edge => [
      edge.fromRoomId,
      edge.toRoomId,
      edge.quadrant,
      edge.kind === 'hole' ? 0 : edge.slot + 1,
    ])),
    kGbaAlttpTextIds: () => assets.addUint16('kGbaAlttpTextIds', text.map(message => message.id)),
    kGbaAlttpTextNative: () => assets.addPacked('kGbaAlttpTextNative', text.map(message => message.bytes)),
    kGbaAlttpTextPortUs: () => assets.addPacked('kGbaAlttpTextPortUs', portText.map(message => Buffer.from(message))),
    kGbaAlttpEntityHandlerTypes: () => assets.addUint8('kGbaAlttpEntityHandlerTypes', handlers.map(handler => handler.type)),
    kGbaAlttpEntityHandlers: () => assets.addUint8('kGbaAlttpEntityHandlers', [...uint32Buffer(handlers.map(handler => handler.thumbAddress))]),
    kGbaAlttpRoomTagHandlerTags: () => assets.addUint8('kGbaAlttpRoomTagHandlerTags', roomTagHandlers.map(handler => handler.tag)),
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
