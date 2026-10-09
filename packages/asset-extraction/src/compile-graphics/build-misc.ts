/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { bufToArr } from '../asset-builder';
import { appendWallPriorityTwins } from '../extensions/second-cartridge-tiles';

const buildMisc = (rom: RomData, A: AssetBuilder): void => {
  A.addUint8('kOverworldMapGfx', bufToArr(rom.getBytes(0x18c000, 0x4000)));
  A.addUint8('kLightOverworldTilemap', bufToArr(rom.getBytes(0xac727, 4096)));
  A.addUint8('kDarkOverworldTilemap', bufToArr(rom.getBytes(0xaD727, 1024)));
  A.addUint16('kPredefinedTileData', rom.getWords(0x9B52, 6438));
  const map16 = rom.getWords(0x8f8000, 3752 * 4);
  appendWallPriorityTwins(map16);
  A.addUint16('kMap16ToMap8', map16);
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

export { buildMisc };
