/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import { bufToArr } from '../asset-builder';
import { appendExtraOverworldEntrance } from '../extensions/second-cartridge-links';
import { buildOverworldContext } from './build-overworld-context';
import type { OverworldContext } from './build-overworld-context.type';
import { buildOverworldExits } from './build-overworld-exits';
import { buildOverworldSprites } from './build-overworld-sprites';
import { buildOverworldTravel } from './build-overworld-travel';

const buildAreaTables = (rom: RomData, A: AssetBuilder, ctx: OverworldContext): void => {
  const { isAreaHead, isSmall, awrite } = ctx;
  const auxTile = new Array(128).fill(0);
  const bgPal = new Array(136).fill(0);
  const signText = new Array(128).fill(0);
  const musicSets = new Array(256).fill(0);
  const musicSets2 = new Array(96).fill(0);

  for (let i = 0; i < 160; i++) {
    if (!isAreaHead(i)) continue;
    if (i < 128) awrite(auxTile, i, i, rom.getByte(0x80fc9c + i));
    if (i < 136) awrite(bgPal, i, i, rom.getByte(0x80fd1c + i));
    if (i < 128) awrite(signText, i, i, rom.getWord(0x87f51d + i * 2));
    if (i < 64) {
      awrite(musicSets, i, i, rom.getByte(0x82c303 + i));
      awrite(musicSets, i, i + 64, rom.getByte(0x82c303 + i + 64));
      awrite(musicSets, i, i + 128, rom.getByte(0x82c303 + i + 128));
      awrite(musicSets, i, i + 192, rom.getByte(0x82c303 + i + 192));
    } else if (i < 160) {
      awrite(musicSets2, i, i - 64, rom.getByte(0x82c403 + i - 64));
    }
  }

  A.addUint8('kOverworldMapIsSmall', isSmall);
  A.addUint8('kOverworldAuxTileThemeIndexes', auxTile);
  A.addUint8('kOverworldBgPalettes', bgPal);
  A.addUint16('kOverworld_SignText', signText);
  A.addUint8('kOwMusicSets', musicSets);
  A.addUint8('kOwMusicSets2', musicSets2);
};

const buildOverworldEntrances = (rom: RomData, A: AssetBuilder): void => {
  const entArea = new Array(129).fill(0);
  const entPos = new Array(129).fill(0);
  const entId = new Array(129).fill(0);
  for (let i = 0; i < 129; i++) {
    entArea[i] = rom.getWord(0x9bb96f + i * 2);
    entPos[i] = rom.getWord(0x9bba71 + i * 2);
    entId[i] = rom.getByte(0x9bbb73 + i);
  }
  appendExtraOverworldEntrance(entArea, entPos, entId);

  A.addUint16('kOverworld_Entrance_Area', entArea);
  A.addUint16('kOverworld_Entrance_Pos', entPos);
  A.addUint8('kOverworld_Entrance_Id', entId);
};

const buildFallHolesSortedByEntrance = (rom: RomData, A: AssetBuilder): void => {
  const holes: { entrance: number; pos: number; area: number }[] = [];
  for (let i = 0; i < 19; i++) {
    const rawPos = rom.getWord(0x9bb800 + i * 2) + 0x400;
    const x = (rawPos >> 1) & 0x3f;
    const y = (rawPos >> 7) & 0x3f;
    const entrance = rom.getByte(0x9bb84c + i);
    const area = rom.getWord(0x9bb826 + i * 2);
    const reencoded = (x << 1) | (((y - 8) & 0x3f) << 7);
    holes.push({ entrance, pos: reencoded, area });
  }
  holes.sort((a, b) => a.entrance - b.entrance || a.pos - b.pos || a.area - b.area);
  A.addUint16('kFallHole_Area', holes.map(h => h.area));
  A.addUint16('kFallHole_Pos', holes.map(h => h.pos));
  A.addUint8('kFallHole_Entrances', holes.map(h => h.entrance));
};

const buildAreaHeadSecrets = (rom: RomData, A: AssetBuilder, ctx: OverworldContext): void => {
  const { isAreaHead, awrite } = ctx;
  const secretOffs = new Array(128).fill(-1);
  const secrets: number[] = [];
  for (let i = 0; i < 160; i++) {
    if (!isAreaHead(i)) continue;
    if (i >= 128) continue;
    let ea = 0x9b0000 | rom.getWord(0x9bc2f9 + i * 2);
    if (rom.getWord(ea) !== 0xffff) {
      const offset = secrets.length;
      awrite(secretOffs, i, i, offset);
      while (rom.getWord(ea) !== 0xffff) {
        const pos = rom.getWord(ea);
        secrets.push(pos & 0xff, pos >> 8, rom.getByte(ea + 2));
        ea += 3;
      }
      secrets.push(0xff, 0xff);
    }
  }
  const emptyOffset = secrets.length > 2 ? secrets.length - 2 : 0;
  for (let i = 0; i < 128; i++) {
    if (secretOffs[i] === -1) secretOffs[i] = emptyOffset;
  }
  A.addUint16('kOverworldSecrets_Offs', secretOffs);
  A.addUint8('kOverworldSecrets', secrets);
};

const buildOverworldTables = (rom: RomData, A: AssetBuilder): void => {
  const ctx = buildOverworldContext(rom);
  buildAreaTables(rom, A, ctx);
  buildOverworldTravel(rom, A, ctx);
  buildOverworldEntrances(rom, A);
  buildFallHolesSortedByEntrance(rom, A);
  buildOverworldExits(rom, A);
  buildAreaHeadSecrets(rom, A, ctx);
  buildOverworldSprites(rom, A, ctx);
  A.addUint8('kMap8DataToTileAttr', bufToArr(rom.getBytes(0x8E9459, 512)));
  A.addUint8('kSomeTileAttr', bufToArr(rom.getBytes(0x9bf110, 3824)));
};

export { buildOverworldTables };
