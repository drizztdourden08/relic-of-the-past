/* @layer shared-asset-extraction @kind logic */
import { AssetBuilder } from '../asset-builder';
import type { GbaRomReader } from '../rom/gba-rom';
import type { RomData } from '../rom/rom-types';
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
import { graphicsBuilders } from './supplement-builders/graphics-builders';
import { roomBuilders } from './supplement-builders/room-builders';
import type { SupplementContext } from './supplement-builders/supplement-builders.type';
import { textBuilders } from './supplement-builders/text-builders';

const supplementContext = (rom: GbaRomReader, snes: RomData): SupplementContext => {
  const source = new GbaAlttpDungeonSource(rom);
  const rooms = source.palaceRooms();
  const spriteGraphics = extractDungeonSpriteGraphics(rom, rooms.map(room => room.header.enemyBlockset));
  const text = extractGbaAlttpText(rom);
  const context: SupplementContext = {
    rom,
    snes,
    assets: new AssetBuilder(),
    source,
    rooms,
    roomIds: new Set(rooms.map(room => room.id)),
    paletteIds: [...new Set(rooms.map(room => room.header.palette))].sort((a, b) => a - b),
    topology: source.palaceTopology(),
    spriteGraphics,
    spritePalettes: extractPalaceSpritePalettes(rom),
    bgTiles: extractPalaceSnes4bppTiles(rom),
    text,
    portText: encodePortText(text.map(message => message.plainText)),
    handlers: extractEntityHandlerTable(rom),
    roomTagHandlers: extractRoomTagHandlerTable(rom),
  };
  assertBlocksetIdentity(snes, context.bgTiles);
  assertEnemySheetNumbering(snes, spriteGraphics.sheets);
  return context;
};

const compileGbaAlttpSupplement = (rom: GbaRomReader, snes: RomData): Buffer => {
  const context = supplementContext(rom, snes);
  const builders: Record<string, () => void> = {
    ...roomBuilders(context),
    ...graphicsBuilders(context),
    ...textBuilders(context),
  };

  if (Object.keys(builders).length !== GBA_ALTTP_ASSET_MANIFEST.length) {
    throw new Error('compileGbaAlttpSupplement: builders and asset-manifest.ts have drifted apart (count mismatch)');
  }
  for (const entry of GBA_ALTTP_ASSET_MANIFEST) {
    const build = builders[entry.name];
    if (!build) throw new Error(`compileGbaAlttpSupplement: no builder registered for manifest entry "${entry.name}"`);
    build();
  }

  return context.assets.serialize();
};

export { compileGbaAlttpSupplement };
