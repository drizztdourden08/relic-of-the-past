/**
 * Graphics asset compilation — sprites, backgrounds, link graphics, misc data, tilemaps, map32.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import { bufToArr, lzDecompressWithLen } from './asset-builder';
import { kCompSpritePtrs, kCompBgPtrs } from './data/tables';

const buildSpriteGfx = (rom: RomData, A: AssetBuilder): void => {
  const all: Buffer[] = [];
  for (let i = 0; i < 108; i++) {
    if (i < 12) {
      all.push(Buffer.from(rom.getBytes(kCompSpritePtrs[i], 0x600)));
    } else {
      const { compressedLength } = lzDecompressWithLen(rom, kCompSpritePtrs[i]);
      all.push(Buffer.from(rom.getBytes(kCompSpritePtrs[i], compressedLength)));
    }
  }
  A.addPacked('kSprGfx', all);
};

const buildBgGfx = (rom: RomData, A: AssetBuilder): void => {
  const all: Buffer[] = [];
  for (let i = 0; i < kCompBgPtrs.length; i++) {
    const { compressedLength } = lzDecompressWithLen(rom, kCompBgPtrs[i]);
    all.push(Buffer.from(rom.getBytes(kCompBgPtrs[i], compressedLength)));
  }
  A.addPacked('kBgGfx', all);
};

const buildLinkGraphics = (rom: RomData, A: AssetBuilder): void => {
  const height = 448;
  const raw = rom.getBytes(0x108000, 0x800 * height / 32);
  const result: number[] = [];
  for (let tile = 0; tile < 16 * (height / 8); tile++) {
    const srcOff = tile * 32;
    for (let b = 0; b < 32; b++) result.push(raw[srcOff + b]);
  }
  A.addUint8('kLinkGraphics', result);
};

const buildMisc = (rom: RomData, A: AssetBuilder): void => {
  A.addUint8('kOverworldMapGfx', bufToArr(rom.getBytes(0x18c000, 0x4000)));
  A.addUint8('kLightOverworldTilemap', bufToArr(rom.getBytes(0xac727, 4096)));
  A.addUint8('kDarkOverworldTilemap', bufToArr(rom.getBytes(0xaD727, 1024)));
  A.addUint16('kPredefinedTileData', rom.getWords(0x9B52, 6438));
  A.addUint16('kMap16ToMap8', rom.getWords(0x8f8000, 3752 * 4));
  A.addUint8('kGeneratedWishPondItem', bufToArr(rom.getBytes(0x888450, 256)));
  A.addUint8('kGeneratedBombosArr', bufToArr(rom.getBytes(0x8890FC, 256)));
  A.addUint8('kGeneratedEndSequence15', bufToArr(rom.getBytes(0x8ead25, 256)));
  A.addUint8('kEnding_Credits_Text', bufToArr(rom.getBytes(0x8EB178, 1989)));
  A.addUint16('kEnding_Credits_Offs', rom.getWords(0x8EB93d, 394));
  A.addUint16('kEnding_MapData', rom.getWords(0x8EB038, 160));
  A.addUint16('kEnding0_Offs', rom.getWords(0x8EC2E1, 17));
  A.addUint8('kEnding0_Data', bufToArr(rom.getBytes(0x8EBF4C, 917)));
  A.addUint16('kPalette_DungBgMain', rom.getWords(0x9BD734, 1800));
  A.addUint16('kPalette_MainSpr', rom.getWords(0x9BD218, 120));
  A.addUint16('kPalette_ArmorAndGloves', rom.getWords(0x9BD308, 75));
  A.addUint16('kPalette_Sword', rom.getWords(0x9BD630, 12));
  A.addUint16('kPalette_Shield', rom.getWords(0x9BD648, 12));
  A.addUint16('kPalette_SpriteAux3', rom.getWords(0x9BD39E, 84));
  A.addUint16('kPalette_MiscSprite_Indoors', rom.getWords(0x9BD446, 77));
  A.addUint16('kPalette_SpriteAux1', rom.getWords(0x9BD4E0, 168));
  A.addUint16('kPalette_OverworldBgMain', rom.getWords(0x9BE6C8, 210));
  A.addUint16('kPalette_OverworldBgAux12', rom.getWords(0x9BE86C, 420));
  A.addUint16('kPalette_OverworldBgAux3', rom.getWords(0x9BE604, 98));
  A.addUint16('kPalette_PalaceMapBg', rom.getWords(0x9BE544, 96));
  A.addUint16('kPalette_PalaceMapSpr', rom.getWords(0x9BD70A, 21));
  A.addUint16('kHudPalData', rom.getWords(0x9BD660, 64));
  A.addUint16('kOverworldMapPaletteData', rom.getWords(0x8ADB27, 256));
};

const buildMap32ToMap16 = (rom: RomData, A: AssetBuilder): void => {
  A.addUint8('kMap32ToMap16_0', bufToArr(rom.getBytes(0x838000, 2218 * 6)));
  A.addUint8('kMap32ToMap16_1', bufToArr(rom.getBytes(0x83b400, 2218 * 6)));
  A.addUint8('kMap32ToMap16_2', bufToArr(rom.getBytes(0x848000, 2218 * 6)));
  A.addUint8('kMap32ToMap16_3', bufToArr(rom.getBytes(0x84b400, 2218 * 6)));
};

const buildTilemaps = (rom: RomData, A: AssetBuilder): void => {
  const kSrcs = [0xcdd6d, 0xce7bf, 0xce2a8, 0xce63c, 0xce456, 0xeda9c];
  for (let i = 0; i < kSrcs.length; i++) {
    let p = kSrcs[i];
    const pOrg = p;
    while (!(rom.getByte(p) & 0x80)) {
      const isMemset = rom.getByte(p + 2) & 0x40;
      const len = ((rom.getByte(p + 2) * 256 + rom.getByte(p + 3)) & 0x3fff) + 1;
      p += 4;
      p += isMemset ? 2 : len;
    }
    const totalLen = p - pOrg + 1;
    A.addUint8(`kBgTilemap_${i}`, bufToArr(rom.getBytes(pOrg, totalLen)));
  }
};

export { buildBgGfx, buildLinkGraphics, buildMap32ToMap16, buildMisc, buildSpriteGfx, buildTilemaps };
