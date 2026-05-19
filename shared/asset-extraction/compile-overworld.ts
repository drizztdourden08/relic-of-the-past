/**
 * Overworld asset compilation — compressed map data, travel tables, entrances, exits, sprites, secrets.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import { bufToArr, lzDecompressWithLen } from './asset-builder';

function buildOverworldCompressed(rom: RomData, A: AssetBuilder): void {
  const hi: Buffer[] = [];
  for (let i = 0; i < 160; i++) {
    const addr = rom.get24(0x82F94D + i * 3);
    const { compressedLength } = lzDecompressWithLen(rom, addr);
    hi.push(Buffer.from(rom.getBytes(addr, compressedLength)));
  }
  A.addPacked('kOverworld_Hibytes_Comp', hi);

  const lo: Buffer[] = [];
  for (let i = 0; i < 160; i++) {
    const addr = rom.get24(0x82FB2D + i * 3);
    const { compressedLength } = lzDecompressWithLen(rom, addr);
    lo.push(Buffer.from(rom.getBytes(addr, compressedLength)));
  }
  A.addPacked('kOverworld_Lobytes_Comp', lo);
}

function buildOverworldTables(rom: RomData, A: AssetBuilder): void {
  // Area head lookup: determines which areas are "heads" (not sub-areas of big areas)
  const areaHeadTable = bufToArr(rom.getBytes(0x82A5EC, 64));
  function isAreaHead(i: number): boolean {
    return i >= 128 || areaHeadTable[i & 63] === (i & 63);
  }

  const isSmall = new Array(192).fill(0);
  for (let i = 0; i < 192; i++) isSmall[i] = rom.getByte(0x82f88d + i);

  // awrite: propagate value to sub-areas of big areas (matching Python's awrite)
  function awrite(arr: number[], area: number, key: number, value: number): void {
    arr[key] = value;
    if (area < 128 && !isSmall[area]) {
      arr[key + 1] = value;
      arr[key + 8] = value;
      arr[key + 9] = value;
    }
  }

  const auxTile = new Array(128).fill(0);
  const bgPal = new Array(136).fill(0);
  const signText = new Array(128).fill(0);
  const musicSets = new Array(256).fill(0);
  const musicSets2 = new Array(96).fill(0);

  // Process area heads only, propagating to sub-areas via awrite
  for (let i = 0; i < 160; i++) {
    if (!isAreaHead(i)) continue;
    if (i < 192) awrite(isSmall, i, i, isSmall[i]);
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

  // Bird travel + whirlpool data
  const travelScreenIdx = new Array(17).fill(0);
  const travelLoadOff = new Array(17).fill(0);
  const travelScrollX = new Array(17).fill(0);
  const travelScrollY = new Array(17).fill(0);
  const travelLinkX = new Array(17).fill(0);
  const travelLinkY = new Array(17).fill(0);
  const travelCamX = new Array(17).fill(0);
  const travelCamY = new Array(17).fill(0);
  const travelUnk1 = new Array(17).fill(0);
  const travelUnk3 = new Array(17).fill(0);
  const whirlpoolAreas = new Array(8).fill(0);

  interface TravelEntry {
    romIndex: number;
    birdTravelId?: number;
    whirlpoolSrcArea?: number;
  }
  const travelByArea = new Map<number, TravelEntry[]>();
  for (let i = 0; i < 17; i++) {
    const screenIndex = rom.getWord(0x82eae5 + i * 2);
    const entry: TravelEntry = { romIndex: i };
    if (i < 9) {
      entry.birdTravelId = i;
    } else {
      entry.whirlpoolSrcArea = rom.getWord(0x82ecf8 + (i - 9) * 2);
    }
    if (!travelByArea.has(screenIndex)) travelByArea.set(screenIndex, []);
    travelByArea.get(screenIndex)!.push(entry);
  }

  let nextWhirlpoolId = 0;
  for (let i = 0; i < 160; i++) {
    if (!isAreaHead(i)) continue;
    const entries = travelByArea.get(i);
    if (!entries) continue;
    for (const t of entries) {
      const ri = t.romIndex;
      let j: number;
      if (t.birdTravelId !== undefined) {
        j = t.birdTravelId;
      } else {
        whirlpoolAreas[nextWhirlpoolId] = t.whirlpoolSrcArea!;
        j = nextWhirlpoolId + 9;
        nextWhirlpoolId++;
      }
      travelScreenIdx[j] = i;
      travelLoadOff[j] = rom.getWord(0x82eb07 + ri * 2);
      travelScrollX[j] = rom.getWord(0x82eb4b + ri * 2);
      travelScrollY[j] = rom.getWord(0x82eb29 + ri * 2);
      travelLinkX[j] = rom.getWord(0x82eb8f + ri * 2);
      travelLinkY[j] = rom.getWord(0x82eb6d + ri * 2);
      travelCamX[j] = rom.getWord(0x82ebd3 + ri * 2);
      travelCamY[j] = rom.getWord(0x82ebb1 + ri * 2);
      travelUnk1[j] = rom.getInt8(0x82ebf5 + ri * 2);
      travelUnk3[j] = rom.getInt8(0x82ec17 + ri * 2);
    }
  }

  A.addUint16('kBirdTravel_ScreenIndex', travelScreenIdx);
  A.addUint16('kBirdTravel_Map16LoadSrcOff', travelLoadOff);
  A.addUint16('kBirdTravel_ScrollX', travelScrollX);
  A.addUint16('kBirdTravel_ScrollY', travelScrollY);
  A.addUint16('kBirdTravel_LinkXCoord', travelLinkX);
  A.addUint16('kBirdTravel_LinkYCoord', travelLinkY);
  A.addUint16('kBirdTravel_CameraXScroll', travelCamX);
  A.addUint16('kBirdTravel_CameraYScroll', travelCamY);
  A.addInt8('kBirdTravel_Unk1', travelUnk1);
  A.addInt8('kBirdTravel_Unk3', travelUnk3);
  A.addUint16('kWhirlpoolAreas', whirlpoolAreas);

  // Overworld entrances
  const entArea = new Array(129).fill(0);
  const entPos = new Array(129).fill(0);
  const entId = new Array(129).fill(0);
  for (let i = 0; i < 129; i++) {
    entArea[i] = rom.getWord(0x9bb96f + i * 2);
    entPos[i] = rom.getWord(0x9bba71 + i * 2);
    entId[i] = rom.getByte(0x9bbb73 + i);
  }
  A.addUint16('kOverworld_Entrance_Area', entArea);
  A.addUint16('kOverworld_Entrance_Pos', entPos);
  A.addUint8('kOverworld_Entrance_Id', entId);

  // Fall holes — sort by entrance_id and re-encode position (matching Python)
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

  // Exit data (79 entries)
  const exitScreen = new Array(79).fill(0);
  const exitRooms = new Array(79).fill(0);
  const exitLoadOff = new Array(79).fill(0);
  const exitScrollX = new Array(79).fill(0);
  const exitScrollY = new Array(79).fill(0);
  const exitX = new Array(79).fill(0);
  const exitY = new Array(79).fill(0);
  const exitCamX = new Array(79).fill(0);
  const exitCamY = new Array(79).fill(0);
  const exitNDoor = new Array(79).fill(0);
  const exitFDoor = new Array(79).fill(0);
  const exitUnk1 = new Array(79).fill(0);
  const exitUnk3 = new Array(79).fill(0);

  const spTop = new Array(16).fill(0);
  const spBot = new Array(16).fill(0);
  const spLeft = new Array(16).fill(0);
  const spRight = new Array(16).fill(0);
  const spT4 = new Array(16).fill(0);
  const spT5 = new Array(16).fill(0);
  const spT6 = new Array(16).fill(0);
  const spT7 = new Array(16).fill(0);
  const spLeftEdge = new Array(16).fill(0);
  const spDir = new Array(16).fill(0);
  const spSprGfx = new Array(16).fill(0);
  const spAuxGfx = new Array(16).fill(0);
  const spPalBg = new Array(16).fill(0);
  const spPalSpr = new Array(16).fill(0);

  for (let i = 0; i < 79; i++) {
    const screenIndex = rom.getByte(0x82de28 + i);

    exitScreen[i] = screenIndex;
    const room = rom.getWord(0x82dd8a + i * 2);
    exitRooms[i] = room;
    exitLoadOff[i] = rom.getWord(0x82de77 + i * 2);
    exitScrollX[i] = rom.getWord(0x82dfb3 + i * 2);
    exitScrollY[i] = rom.getWord(0x82df15 + i * 2);
    exitX[i] = rom.getWord(0x82e0ef + i * 2);
    exitY[i] = rom.getWord(0x82e051 + i * 2);
    exitCamX[i] = rom.getWord(0x82e22b + i * 2);
    exitCamY[i] = rom.getWord(0x82e18d + i * 2);
    exitUnk1[i] = rom.getInt8(0x82e2c9 + i);
    exitUnk3[i] = rom.getInt8(0x82e318 + i);
    exitNDoor[i] = rom.getWord(0x82e367 + i * 2);
    exitFDoor[i] = rom.getWord(0x82e405 + i * 2);

    if (room >= 0x180 && room < 0x190) {
      const j = room - 0x180;
      spDir[j] = rom.getByte(0x82e801 + j) & 0xfe;
      spSprGfx[j] = rom.getByte(0x82e811 + j);
      spAuxGfx[j] = rom.getByte(0x82e821 + j);
      spPalBg[j] = rom.getByte(0x82e831 + j);
      spPalSpr[j] = rom.getByte(0x82e841 + j);
      spTop[j] = rom.getWord(0x82e6e1 + j * 2);
      spBot[j] = rom.getWord(0x82e701 + j * 2);
      spLeft[j] = rom.getWord(0x82e721 + j * 2);
      spRight[j] = rom.getWord(0x82e741 + j * 2);
      spLeftEdge[j] = rom.getWord(0x82e7e1 + j * 2);
      spT4[j] = rom.getInt16(0x82e761 + j * 2);
      spT6[j] = rom.getInt16(0x82e781 + j * 2);
      spT5[j] = rom.getInt16(0x82e7a1 + j * 2);
      spT7[j] = rom.getInt16(0x82e7c1 + j * 2);
    }
  }

  A.addUint8('kExitData_ScreenIndex', exitScreen);
  A.addUint16('kExitDataRooms', exitRooms);
  A.addUint16('kExitData_Map16LoadSrcOff', exitLoadOff);
  A.addUint16('kExitData_ScrollX', exitScrollX);
  A.addUint16('kExitData_ScrollY', exitScrollY);
  A.addUint16('kExitData_XCoord', exitX);
  A.addUint16('kExitData_YCoord', exitY);
  A.addUint16('kExitData_CameraXScroll', exitCamX);
  A.addUint16('kExitData_CameraYScroll', exitCamY);
  A.addUint16('kExitData_NormalDoor', exitNDoor);
  A.addUint16('kExitData_FancyDoor', exitFDoor);
  A.addInt8('kExitData_Unk1', exitUnk1);
  A.addInt8('kExitData_Unk3', exitUnk3);

  A.addUint16('kSpExit_Top', spTop);
  A.addUint16('kSpExit_Bottom', spBot);
  A.addUint16('kSpExit_Left', spLeft);
  A.addUint16('kSpExit_Right', spRight);
  A.addInt16('kSpExit_Tab4', spT4);
  A.addInt16('kSpExit_Tab5', spT5);
  A.addInt16('kSpExit_Tab6', spT6);
  A.addInt16('kSpExit_Tab7', spT7);
  A.addUint16('kSpExit_LeftEdgeOfMap', spLeftEdge);
  A.addUint8('kSpExit_Dir', spDir);
  A.addUint8('kSpExit_SprGfx', spSprGfx);
  A.addUint8('kSpExit_AuxGfx', spAuxGfx);
  A.addUint8('kSpExit_PalBg', spPalBg);
  A.addUint8('kSpExit_PalSpr', spPalSpr);

  // Overworld secrets — only process area heads
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

  // Overworld sprites — 4 separate stage passes
  const sprOffs = new Array(144 * 3).fill(0);
  const sprData: number[] = [0xff];
  const sprGfx = new Array(256).fill(0);
  const sprPal = new Array(256).fill(0);

  function readAndAppendSprites(baseAddr: number, area: number, stageIdxs: number[]): void {
    let ea = 0x890000 + rom.getWord(baseAddr + area * 2);
    if (rom.getByte(ea) === 0xff) return;
    const off = sprData.length;
    for (const stage of stageIdxs) {
      sprOffs[stage * 144 + area] = off;
    }
    while (rom.getByte(ea) !== 0xff) {
      sprData.push(rom.getByte(ea), rom.getByte(ea + 1), rom.getByte(ea + 2));
      ea += 3;
    }
    sprData.push(0xff);
  }

  function doSpriteRange(start: number, end: number, baseAddr: number, stageIdxs: number[], infoStage: number): void {
    for (let i = 0; i < 160; i++) {
      if (!isAreaHead(i)) continue;
      if (i < start || i >= end) continue;
      if (i < 128) {
        awrite(sprGfx, i, (i & 63) + infoStage * 64, rom.getByte(0x80fa41 + (i & 63) + infoStage * 64));
        awrite(sprPal, i, (i & 63) + infoStage * 64, rom.getByte(0x80fb41 + (i & 63) + infoStage * 64));
      }
      readAndAppendSprites(baseAddr, i, stageIdxs);
    }
  }

  doSpriteRange(0, 64, 0x89c881, [0], 0);
  doSpriteRange(0, 64, 0x89c901, [1], 1);
  doSpriteRange(0, 64, 0x89ca21, [2], 2);
  doSpriteRange(64, 144, 0x89ca21, [1, 2], 3);

  A.addUint16('kOverworldSpriteOffs', sprOffs);
  A.addUint8('kOverworldSprites', sprData);
  A.addUint8('kOverworldSpriteGfx', sprGfx);
  A.addUint8('kOverworldSpritePalettes', sprPal);

  A.addUint8('kMap8DataToTileAttr', bufToArr(rom.getBytes(0x8E9459, 512)));
  A.addUint8('kSomeTileAttr', bufToArr(rom.getBytes(0x9bf110, 3824)));
}

export { buildOverworldCompressed, buildOverworldTables };
