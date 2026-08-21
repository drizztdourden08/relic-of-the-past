/* @layer tests @kind test */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { compileGbaAlttpSupplement } from '../../shared/asset-extraction/compile-resources-gba-alttp';
import { decode4bppTile } from '../../shared/asset-extraction/graphics/bitplane-decoder';
import {
  convertGbaMapWordToSnes,
  convertGbaSheetToSnes4bpp,
  decodeGbaPacked4bppTile,
} from '../../shared/asset-extraction/graphics/gba-native';
import { loadGbaAlttpRomFromBuffer } from '../../shared/asset-extraction/rom/gba-rom';
import {
  GbaAlttpDungeonSource,
  PALACE_ROOM_IDS,
  decodeGbaAlttpSaveProgression,
  extractEntityHandlerTable,
  extractRoomTagHandlerTable,
  extractGbaAlttpText,
  extractDungeonSpriteGraphics,
} from '../../shared/asset-extraction/sources/gba-alttp';

describe('GBA to SNES native translation', () => {
  it('moves GBA palette and flip bits into the SNES tilemap layout', () => {
    const gba = 0x3000 | 0x0800 | 0x0400 | 0x0155;
    expect(convertGbaMapWordToSnes(gba)).toBe(0xc000 | 0x0c00 | 0x0155);
  });

  it('preserves indexed pixels when converting packed GBA to planar SNES 4bpp', () => {
    const packed = Buffer.alloc(32);
    for (let i = 0; i < packed.length; i++) packed[i] = (i * 2 & 15) | ((i * 2 + 1 & 15) << 4);
    const planar = convertGbaSheetToSnes4bpp(packed);
    expect([...decode4bppTile(planar, 0)]).toEqual([...decodeGbaPacked4bppTile(packed)]);
  });
});

const romPath = resolve('test-roms', 'Legend of Zelda, The - A Link to the Past & Four Swords (USA).gba');
const integration = existsSync(romPath) ? it : it.skip;

integration('extracts and compiles every Palace room from the validated ROM', () => {
  const rom = loadGbaAlttpRomFromBuffer(readFileSync(romPath));
  const rooms = new GbaAlttpDungeonSource(rom).palaceRooms();
  expect(rooms.map(room => room.id)).toEqual([...PALACE_ROOM_IDS]);
  expect(rooms.every(room => room.layers.length === 3)).toBe(true);
  expect(rooms.every(room => room.layers.every(layer => layer.snesWords.length === 4096))).toBe(true);
  expect(rooms.every(room => room.layers.every(layer => layer.collision.length === 4096))).toBe(true);
  const entrance = rooms.find(room => room.id === 0x88)!;
  expect(entrance.provenance.tileAttributesAddress).toBe(0x0815e714);
  expect(entrance.layers[0].collision[8 * 64 + 32]).toBe(0x00);
  expect(entrance.layers[0].collision[9 * 64 + 32]).toBe(0x68);
  const spriteGraphics = extractDungeonSpriteGraphics(rom, [44, 46, 47, 48, 49, 50, 51]);
  expect(spriteGraphics.tilesets.find(tileset => tileset.enemyBlockset === 44)?.sheetIds).toEqual([21, 255, 39, 29]);
  expect(spriteGraphics.tilesets.find(tileset => tileset.enemyBlockset === 51)?.sheetIds).toEqual([81, 44, 59, 82]);
  expect(spriteGraphics.sheets.every(sheet => sheet.snes4bpp.length === 0x800)).toBe(true);
  const source = new GbaAlttpDungeonSource(rom);
  expect(source.palaceTopology().some(edge => edge.insidePalace)).toBe(true);
  const handlers = extractEntityHandlerTable(rom);
  expect(handlers).toHaveLength(0xf8);
  expect(handlers[0xf5].thumbAddress).toBe(0x080e5570);
  const tagHandlers = extractRoomTagHandlerTable(rom);
  expect(tagHandlers).toHaveLength(0x43);
  expect(tagHandlers.slice(0x40).map(handler => handler.thumbAddress)).toEqual([
    0x0807b7c0,
    0x0807b244,
    0x0807a088,
  ]);
  expect(rooms.flatMap(room => source.roomInteractions(room)).some(cell => cell.kind === 'deep-water')).toBe(true);
  expect(rooms.flatMap(room => source.roomInteractions(room)).some(cell => cell.kind === 'conveyor-left')).toBe(true);
  const text = extractGbaAlttpText(rom);
  expect(text).toHaveLength(0x1c7);
  expect(text[0x1a5].plainText.replace(/\s+/g, ' ')).toContain('only true heroes can enter this palace');
  expect(text[0x1b2].plainText).toContain('Spin like a tornado');
  expect(compileGbaAlttpSupplement(rom).length).toBeGreaterThan(100_000);
});

const savePath = resolve('test-roms', 'Legend of Zelda, The - A Link to the Past & Four Swords (USA).sav');
const saveIntegration = existsSync(savePath) ? it : it.skip;

saveIntegration('decodes the GBA-exclusive sword powers from SRAM', () => {
  const slots = decodeGbaAlttpSaveProgression(readFileSync(savePath));
  expect(slots).toHaveLength(3);
  expect(slots.every(slot => slot.type === 'INIT')).toBe(true);
  expect(slots.every(slot => !slot.hurricaneSpin)).toBe(true);
});
