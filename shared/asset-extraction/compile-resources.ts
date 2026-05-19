/**
 * Compile resources — produces zelda3_assets.dat from ROM data.
 * This is the final pipeline stage that assembles all game assets into a binary file.
 *
 * Ported from: core/zelda3/assets/compile_resources.py
 */
import { createHash } from 'crypto';
import type { RomData } from './rom/rom-types';
import { kCompSpritePtrs, kCompBgPtrs } from './data/tables';
import { decompress as lzDecompress } from './compression/lz-decompress';
import { decodeStrings } from './text/dialogue-decoder';
import { compressStrings, encodeDictionary } from './text/dialogue-encoder';
import { usesNewFormat } from './text/language-data';
import { extractSoundData } from './music/extract-music';
import { compileSoundBank, produceLoadableSeq } from './music/compile-music';

/** Convert Buffer to number array (avoids downlevelIteration issues) */
function bufToArr(buf: Buffer): number[] {
  return Array.from(buf);
}


// ─── Asset accumulator ───

type AssetType = 'uint8' | 'uint16' | 'int8' | 'int16' | 'packed';

interface AssetEntry {
  type: AssetType;
  data: Buffer;
}

class AssetBuilder {
  private assets = new Map<string, AssetEntry>();

  addUint8(name: string, data: number[]): void {
    this.assets.set(name, { type: 'uint8', data: Buffer.from(data) });
  }

  addUint16(name: string, data: number[]): void {
    const buf = Buffer.alloc(data.length * 2);
    for (let i = 0; i < data.length; i++) buf.writeUInt16LE(data[i] & 0xffff, i * 2);
    this.assets.set(name, { type: 'uint16', data: buf });
  }

  addInt8(name: string, data: number[]): void {
    const buf = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i++) buf.writeInt8(data[i] & 0xff ? (data[i] > 127 ? data[i] - 256 : data[i]) : 0, i);
    this.assets.set(name, { type: 'int8', data: Buffer.from(new Int8Array(data).buffer) });
  }

  addInt16(name: string, data: number[]): void {
    const buf = Buffer.alloc(data.length * 2);
    for (let i = 0; i < data.length; i++) buf.writeInt16LE(data[i], i * 2);
    this.assets.set(name, { type: 'int16', data: buf });
  }

  addPacked(name: string, arrays: Buffer[]): void {
    this.assets.set(name, { type: 'packed', data: packArrays(arrays) });
  }

  /** Serialize all assets into the zelda3_assets.dat binary format */
  serialize(): Buffer {
    const keySig = Buffer.concat(
      Array.from(this.assets.keys()).map(k => Buffer.from(k + '\0', 'utf8'))
    );
    const assetsSig = Buffer.concat([
      Buffer.from('Zelda3_v0     \n\0', 'ascii'),
      createHash('sha256').update(keySig).digest(),
    ]);

    const allData = Array.from(this.assets.values()).map(a => a.data);
    const hdr = Buffer.alloc(assetsSig.length + 32 + 8);
    assetsSig.copy(hdr, 0);
    hdr.writeUInt32LE(allData.length, assetsSig.length + 32);
    hdr.writeUInt32LE(keySig.length, assetsSig.length + 32 + 4);

    const encodedSizes = Buffer.alloc(allData.length * 4);
    for (let i = 0; i < allData.length; i++) {
      encodedSizes.writeUInt32LE(allData[i].length, i * 4);
    }

    const parts: Buffer[] = [hdr, encodedSizes, keySig];
    for (const v of allData) {
      // Align to 4 bytes
      const pad = (4 - (totalLen(parts) % 4)) % 4;
      if (pad > 0) parts.push(Buffer.alloc(pad));
      parts.push(v);
    }

    return Buffer.concat(parts);
  }
}

function totalLen(bufs: Buffer[]): number {
  return bufs.reduce((s, b) => s + b.length, 0);
}

/** Pack multiple byte arrays with index table (matches C engine's FindInAssetArray) */
function packArrays(arr: Buffer[]): Buffer {
  if (arr.length === 0) return Buffer.alloc(0);
  const offsets: number[] = [];
  let offs = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    offs += arr[i].length;
    offsets.push(offs);
  }
  if (offs < 65536 && arr.length <= 8192) {
    const hdr = Buffer.alloc(offsets.length * 2 + 2);
    for (let i = 0; i < offsets.length; i++) hdr.writeUInt16LE(offsets[i], i * 2);
    hdr.writeUInt16LE(arr.length - 1, offsets.length * 2);
    return Buffer.concat([Buffer.alloc(offsets.length * 2, 0).fill((() => { const b = Buffer.alloc(offsets.length * 2); for (let i = 0; i < offsets.length; i++) b.writeUInt16LE(offsets[i], i * 2); return b; })(), 0, offsets.length * 2), ...arr, (() => { const b = Buffer.alloc(2); b.writeUInt16LE(arr.length - 1, 0); return b; })()]);
  } else {
    const idxBuf = Buffer.alloc(offsets.length * 4);
    for (let i = 0; i < offsets.length; i++) idxBuf.writeUInt32LE(offsets[i], i * 4);
    const trailer = Buffer.alloc(2);
    trailer.writeUInt16LE(8192 + arr.length - 1, 0);
    return Buffer.concat([idxBuf, ...arr, trailer]);
  }
}

// ─── Individual asset builders ───

function buildSpriteGfx(rom: RomData, A: AssetBuilder): void {
  const all: Buffer[] = [];
  for (let i = 0; i < 108; i++) {
    if (i < 12) {
      all.push(Buffer.from(rom.getBytes(kCompSpritePtrs[i], 0x600)));
    } else {
      const { data, compressedLength } = lzDecompressWithLen(rom, kCompSpritePtrs[i]);
      all.push(Buffer.from(rom.getBytes(kCompSpritePtrs[i], compressedLength)));
    }
  }
  A.addPacked('kSprGfx', all);
}

function buildBgGfx(rom: RomData, A: AssetBuilder): void {
  const all: Buffer[] = [];
  for (let i = 0; i < kCompBgPtrs.length; i++) {
    const { compressedLength } = lzDecompressWithLen(rom, kCompBgPtrs[i]);
    all.push(Buffer.from(rom.getBytes(kCompBgPtrs[i], compressedLength)));
  }
  A.addPacked('kBgGfx', all);
}

function buildLinkGraphics(rom: RomData, A: AssetBuilder): void {
  // Encode link sprites directly from ROM (4bpp SNES format)
  const height = 448;
  const raw = rom.getBytes(0x108000, 0x800 * height / 32);
  // Already in SNES 4bpp format — just pass through as-is
  const result: number[] = [];
  for (let tile = 0; tile < 16 * (height / 8); tile++) {
    const srcOff = tile * 32;
    for (let b = 0; b < 32; b++) result.push(raw[srcOff + b]);
  }
  A.addUint8('kLinkGraphics', result);
}

function buildMisc(rom: RomData, A: AssetBuilder): void {
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
}

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
  // Python iterates area heads and assigns by bird_travel_id/whirlpool index.
  // The ROM stores travel entries at indices 0-8 (bird) and 9-16 (whirlpool).
  // Bird entries (0-8): read directly, add base coordinates.
  // Whirlpool entries (9-16): reorder based on area-head iteration order.
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

  // Build travel info map: screen_index -> list of travel entries
  // (matching Python's get_ow_travel_infos which groups by screen_index)
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

  // Iterate area heads in order, assigning travel entries (matching Python's iteration)
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
      // Python round-trips: extract subtracts base, compile adds back = raw ROM values
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
    // Re-encode with y-8 offset (matching Python's compile_resources.py)
    const reencoded = (x << 1) | (((y - 8) & 0x3f) << 7);
    holes.push({ entrance, pos: reencoded, area });
  }
  // Python's sorted() sorts tuples by (entrance, pos, area)
  holes.sort((a, b) => a.entrance - b.entrance || a.pos - b.pos || a.area - b.area);
  const holeArea = holes.map(h => h.area);
  const holePos = holes.map(h => h.pos);
  const holeEnt = holes.map(h => h.entrance);
  A.addUint16('kFallHole_Area', holeArea);
  A.addUint16('kFallHole_Pos', holePos);
  A.addUint8('kFallHole_Entrances', holeEnt);

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

  // Special exits (16 entries from room 0x180-0x18F)
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

  // Read exits and special exits via area-head iteration (matching Python)
  for (let i = 0; i < 79; i++) {
    const screenIndex = rom.getByte(0x82de28 + i);
    const baseX = (screenIndex & 7) << 9;
    const baseY = (screenIndex & 56) << 6;

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

    // Populate special exit data only for rooms 0x180-0x18F
    if (room >= 0x180 && room < 0x190) {
      const j = room - 0x180;
      // Python: extract reads (dir >> 1), compile writes (dir * 2) => clears low bit
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

  // Overworld secrets — only process area heads (matching Python)
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

  // Overworld sprites — 4 separate stage passes (matching Python's do_sprite_range order)
  const sprOffs = new Array(144 * 3).fill(0);
  const sprData: number[] = [0xff]; // starts with terminator
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
      // Write gfx/palette via awrite for areas < 128
      if (i < 128) {
        awrite(sprGfx, i, (i & 63) + infoStage * 64, rom.getByte(0x80fa41 + (i & 63) + infoStage * 64));
        awrite(sprPal, i, (i & 63) + infoStage * 64, rom.getByte(0x80fb41 + (i & 63) + infoStage * 64));
      }
      readAndAppendSprites(baseAddr, i, stageIdxs);
    }
  }

  // Match Python's 4-call order: Beginning, FirstPart, SecondPart, then DW/SP
  doSpriteRange(0, 64, 0x89c881, [0], 0);     // LW Beginning
  doSpriteRange(0, 64, 0x89c901, [1], 1);     // LW FirstPart
  doSpriteRange(0, 64, 0x89ca21, [2], 2);     // LW SecondPart
  doSpriteRange(64, 144, 0x89ca21, [1, 2], 3); // DW/SP

  A.addUint16('kOverworldSpriteOffs', sprOffs);
  A.addUint8('kOverworldSprites', sprData);
  A.addUint8('kOverworldSpriteGfx', sprGfx);
  A.addUint8('kOverworldSpritePalettes', sprPal);

  A.addUint8('kMap8DataToTileAttr', bufToArr(rom.getBytes(0x8E9459, 512)));
  A.addUint8('kSomeTileAttr', bufToArr(rom.getBytes(0x9bf110, 3824)));
}

function buildDungeonMap(rom: RomData, A: AssetBuilder): void {
  const kSizes = [75, 125, 50, 75, 175, 75, 50, 75, 50, 200, 150, 75, 100, 200];
  const layouts: Buffer[] = [];
  const tiles: Buffer[] = [];
  for (let i = 0; i < 14; i++) {
    const addr = 0xa0000 + rom.getWord(0x8AF605 + i * 2);
    const b = rom.getBytes(addr, kSizes[i]);
    const nonzero = kSizes[i] - Array.from(b).filter(x => x === 0xf).length;
    layouts.push(Buffer.from(b));
    const tileAddr = 0xa0000 + rom.getWord(0x8AFBE4 + i * 2);
    tiles.push(Buffer.from(rom.getBytes(tileAddr, nonzero)));
  }
  A.addPacked('kDungMap_FloorLayout', layouts);
  A.addPacked('kDungMap_Tiles', tiles);
}

function buildDungeonSprites(rom: RomData, A: AssetBuilder): void {
  const offsets = new Array(320).fill(0);
  const data: number[] = [0, 0xff];
  for (let i = 0; i < 320; i++) {
    let ea = 0x890000 + rom.getWord(0x89d62e + i * 2);
    const sortMode = rom.getByte(ea);
    ea++;
    // Count sprites
    let count = 0;
    let check = ea;
    while (rom.getByte(check) !== 0xff) { count++; check += 3; }
    if (count === 0 && sortMode === 0) continue;
    offsets[i] = data.length;
    data.push(sortMode);
    ea = 0x890000 + rom.getWord(0x89d62e + i * 2) + 1;
    while (rom.getByte(ea) !== 0xff) {
      data.push(rom.getByte(ea), rom.getByte(ea + 1), rom.getByte(ea + 2));
      ea += 3;
    }
    data.push(0xff);
  }
  A.addUint8('kDungeonSprites', data);
  A.addUint16('kDungeonSpriteOffs', offsets);
}

function buildDungeonSecrets(rom: RomData, A: AssetBuilder): void {
  const result = new Array(640).fill(0);
  for (let i = 0; i < 320; i++) {
    let ea = 0x810000 | rom.getWord(0x81db69 + i * 2);
    if (rom.getWord(ea) === 0xffff) {
      // Will be fixed below
      result[i * 2] = -1;
      result[i * 2 + 1] = -1;
    } else {
      result[i * 2] = result.length & 0xff;
      result[i * 2 + 1] = result.length >> 8;
      while (rom.getWord(ea) !== 0xffff) {
        const pos = rom.getWord(ea);
        result.push(pos & 0xff, pos >> 8, rom.getByte(ea + 2));
        ea += 3;
      }
      result.push(0xff, 0xff);
    }
  }
  const emptyOff = result.length - 2;
  for (let i = 0; i < 320; i++) {
    if (result[i * 2] === -1) {
      result[i * 2] = emptyOff & 0xff;
      result[i * 2 + 1] = emptyOff >> 8;
    }
  }
  A.addUint8('kDungeonSecrets', result);
}

function buildDungeonRooms(rom: RomData, A: AssetBuilder): void {
  const data: number[] = [];
  const offsets = new Array(320).fill(0);
  const doorOffsets = new Array(320).fill(0);
  const roomHeaders: number[] = [];
  const headerOffsets = new Array(320).fill(0);
  const chests: number[] = [];
  const signTexts = new Array(320).fill(0);
  const pitsHurt: number[] = [];

  for (let i = 0; i < 320; i++) {
    // Room address
    let p = 0x1f8000 + i * 3;
    const roomAddr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);

    // Room header pointer
    p = 0x40000 | rom.getWord(0x4f502 + i * 2);
    if (p === 0x4ffef) p = 0x82edc5;

    const floor = rom.getByte(roomAddr);
    const layout = rom.getByte(roomAddr + 1);
    const flags = rom.getByte(p + 0);
    const p7val = rom.getByte(p + 7);
    const p8val = rom.getByte(p + 8);

    signTexts[i] = rom.getWord(0x87f61d + i * 2);

    // Build header — mask p8 to bottom 2 bits (matching Python's extraction round-trip)
    const hdr = [
      (flags >> 5) << 5 | ((flags >> 2) & 7) << 2 | (flags & 1),
      rom.getByte(p + 1), rom.getByte(p + 2), rom.getByte(p + 3),
      rom.getByte(p + 4), rom.getByte(p + 5), rom.getByte(p + 6),
      p7val, p8val & 3,
      rom.getByte(p + 9), rom.getByte(p + 10), rom.getByte(p + 11), rom.getByte(p + 12), rom.getByte(p + 13),
    ];

    // Append header with scan-append dedup
    headerOffsets[i] = appendScanBytes(roomHeaders, hdr);

    // Room object data
    offsets[i] = data.length;
    data.push(floor, layout);

    // Copy all room object data verbatim (3 layers)
    let objP = roomAddr + 2;
    for (let layer = 0; layer < 3; layer++) {
      while (true) {
        const w = rom.getByte(objP) | (rom.getByte(objP + 1) << 8);
        if (w === 0xffff) { data.push(0xff, 0xff); objP += 2; break; }
        if (w === 0xfff0) {
          data.push(0xf0, 0xff);
          objP += 2;
          // Doors follow
          if (layer === 2) doorOffsets[i] = data.length;
          while (true) {
            const dw = rom.getByte(objP) | (rom.getByte(objP + 1) << 8);
            if (dw === 0xffff) { data.push(0xff, 0xff); objP += 2; break; }
            data.push(rom.getByte(objP), rom.getByte(objP + 1));
            objP += 2;
          }
          break;
        }
        data.push(rom.getByte(objP), rom.getByte(objP + 1), rom.getByte(objP + 2));
        objP += 3;
      }
    }
  }

  // Pits that hurt player — match Python: build set from ROM, then collect rooms in order
  const pitsSet = new Set<number>();
  for (let i = 0; i < 57; i++) {
    pitsSet.add(rom.getWord(0x80990c + i * 2));
  }
  for (let i = 0; i < 320; i++) {
    if (pitsSet.has(i)) pitsHurt.push(i);
  }

  // Chests — handle big chest flag from ROM (high bit of room word)
  const chestAddr = 0x81e96e;
  // Group chests by room, matching Python's YAML-based approach
  const chestsByRoom = new Map<number, { item: number; big: boolean }[]>();
  for (let i = 0; i < 168; i++) {
    const roomWord = rom.getWord(chestAddr + i * 3);
    const item = rom.getByte(chestAddr + i * 3 + 2);
    const room = roomWord & 0x7fff;
    const big = (roomWord & 0x8000) !== 0;
    if (!chestsByRoom.has(room)) chestsByRoom.set(room, []);
    chestsByRoom.get(room)!.push({ item, big });
  }
  // Iterate rooms 0-319, emit chests in room order (matching Python)
  for (let i = 0; i < 320; i++) {
    const roomChests = chestsByRoom.get(i);
    if (!roomChests) continue;
    for (const c of roomChests) {
      chests.push(i & 0xff, (i >> 8) | (c.big ? 0x80 : 0), c.item);
    }
  }

  A.addUint8('kDungeonRoom', data);
  A.addUint16('kDungeonRoomOffs', offsets);
  A.addUint16('kDungeonRoomDoorOffs', doorOffsets);
  A.addUint8('kDungeonRoomHeaders', roomHeaders);
  A.addUint16('kDungeonRoomHeadersOffs', headerOffsets);
  A.addUint8('kDungeonRoomChests', chests);
  A.addUint16('kDungeonRoomTeleMsg', signTexts);
  A.addUint16('kDungeonPitsHurtPlayer', pitsHurt);

  // Entrance data (133 entries)
  buildEntranceData(rom, A, 0, 133, 'kEntranceData_');
  // Starting points (7 entries)
  buildEntranceData(rom, A, 1, 7, 'kStartingPoint_');
}

function buildEntranceData(rom: RomData, A: AssetBuilder, set: 0 | 1, count: number, prefix: string): void {
  const rooms: number[] = [];
  const relCoords: number[] = [];
  const scrollX: number[] = [];
  const scrollY: number[] = [];
  const playerX: number[] = [];
  const playerY: number[] = [];
  const cameraX: number[] = [];
  const cameraY: number[] = [];
  const blockset: number[] = [];
  const floor: number[] = [];
  const palace: number[] = [];
  const doorway: number[] = [];
  const startBg: number[] = [];
  const quad1: number[] = [];
  const quad2: number[] = [];
  const doorSettings: number[] = [];
  const music: number[] = [];
  const entrance: number[] = [];

  const roomAddr = [0x82c813, 0x82db6e][set];
  const seBase = [0x82c91d, 0x82db7c][set];

  for (let i = 0; i < count; i++) {
    const room = rom.getWord(roomAddr + i * 2);
    rooms.push(room);

    const baseX = (room & 0xf) * 2;
    const baseY = (room >> 4) * 2;
    const pX = rom.getWord([0x82d063, 0x82dbde][set] + i * 2);
    const pY = rom.getWord([0x82cf59, 0x82dbd0][set] + i * 2);
    const sX = rom.getWord([0x82cd45, 0x82dbb4][set] + i * 2);
    const sY = rom.getWord([0x82ce4f, 0x82dbc2][set] + i * 2);
    scrollX.push(sX);
    scrollY.push(sY);
    playerX.push(pX);
    playerY.push(pY);
    cameraX.push(rom.getWord([0x82d277, 0x82dbfa][set] + i * 2));
    cameraY.push(rom.getWord([0x82d16d, 0x82dbec][set] + i * 2));
    blockset.push(rom.getByte([0x82d381, 0x82dc08][set] + i));
    floor.push(rom.getInt8([0x82d406, 0x82dc0f][set] + i));
    const palVal = rom.getInt8([0x82d48b, 0x82dc16][set] + i);
    palace.push(palVal);
    doorway.push(set === 0 ? rom.getInt8(0x82d510 + i) : 0);
    const bg = rom.getByte([0x82d595, 0x82dc1d][set] + i);
    startBg.push(bg);
    const qb = rom.getByte([0x82d61a, 0x82dc24][set] + i);
    quad1.push(qb);
    quad2.push(rom.getByte([0x82d69f, 0x82dc2b][set] + i));
    doorSettings.push(rom.getWord([0x82d724, 0x82dc32][set] + i * 2));
    music.push(rom.getByte([0x82d82e, 0x82dc4e][set] + i));

    // Relative coords (8 bytes per entrance)
    for (let j = 0; j < 8; j++) {
      relCoords.push(rom.getByte(seBase + i * 8 + j));
    }

    if (set === 1) {
      entrance.push(rom.getWord(0x82dc40 + i * 2));
    }
  }

  A.addUint16(prefix + 'rooms', rooms);
  A.addUint8(prefix + 'relativeCoords', relCoords);
  A.addUint16(prefix + 'scrollX', scrollX);
  A.addUint16(prefix + 'scrollY', scrollY);
  A.addUint16(prefix + 'playerX', playerX);
  A.addUint16(prefix + 'playerY', playerY);
  A.addUint16(prefix + 'cameraX', cameraX);
  A.addUint16(prefix + 'cameraY', cameraY);
  A.addUint8(prefix + 'blockset', blockset);
  A.addInt8(prefix + 'floor', floor);
  A.addInt8(prefix + 'palace', palace);
  A.addUint8(prefix + 'doorwayOrientation', doorway);
  A.addUint8(prefix + 'startingBg', startBg);
  A.addUint8(prefix + 'quadrant1', quad1);
  A.addUint8(prefix + 'quadrant2', quad2);
  A.addUint16(prefix + 'doorSettings', doorSettings);
  if (set === 1) A.addUint8(prefix + 'entrance', entrance);
  A.addUint8(prefix + 'musicTrack', music);
}

function buildMap32ToMap16(rom: RomData, A: AssetBuilder): void {
  function getChunk(baseAddr: number): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < 2218; i++) {
      const ea = baseAddr + i * 6;
      const ov = [0, 1, 2, 3, 4, 5].map(j => rom.getByte(ea + j));
      result.push([
        ov[0] | ((ov[4] >> 4) << 8),
        ov[1] | ((ov[4] & 0xf) << 8),
        ov[2] | ((ov[5] >> 4) << 8),
        ov[3] | ((ov[5] & 0xf) << 8),
      ]);
    }
    return result;
  }

  const t0 = getChunk(0x838000);
  const t1 = getChunk(0x83b400);
  const t2 = getChunk(0x848000);
  const t3 = getChunk(0x84b400);

  function packResult(chunks: number[][][], idx: number): number[] {
    const res: number[] = [];
    for (let i = 0; i < 2218; i += 4) {
      for (let j = 0; j < 4; j++) {
        const vals = [chunks[0][i + j]?.[idx] ?? 0, chunks[1][i + j]?.[idx] ?? 0, chunks[2][i + j]?.[idx] ?? 0, chunks[3][i + j]?.[idx] ?? 0];
        res.push(vals[0] & 0xff, vals[1] & 0xff, vals[2] & 0xff, vals[3] & 0xff,
          (vals[0] >> 8) << 4 | (vals[1] >> 8), (vals[2] >> 8) << 4 | (vals[3] >> 8));
      }
    }
    return res;
  }

  // The actual format packs groups of 4 map32 entries per layer
  // Simpler approach: read the raw map32 data directly as the C engine expects it
  A.addUint8('kMap32ToMap16_0', bufToArr(rom.getBytes(0x838000, 2218 * 6)));
  A.addUint8('kMap32ToMap16_1', bufToArr(rom.getBytes(0x83b400, 2218 * 6)));
  A.addUint8('kMap32ToMap16_2', bufToArr(rom.getBytes(0x848000, 2218 * 6)));
  A.addUint8('kMap32ToMap16_3', bufToArr(rom.getBytes(0x84b400, 2218 * 6)));
}

function buildEnemyDamageData(rom: RomData, A: AssetBuilder): void {
  // Python uses offset_is_be=True for enemy damage decompression
  const [data] = lzDecompress(0x83e800, (a) => rom.getByte(a), true, true);
  A.addUint8('kEnemyDamageData', Array.from(data));
}

function buildTilemaps(rom: RomData, A: AssetBuilder): void {
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
}

function buildDungeonAttrs(rom: RomData, A: AssetBuilder): void {
  A.addUint16('kDungAttrsForTile_Offs', rom.getWords(0x8e9000, 21));
  A.addUint8('kDungAttrsForTile', bufToArr(rom.getBytes(0x8e902a, 1024)));
  A.addUint16('kMovableBlockDataInit', rom.getWords(0x84f1de, 198));
  A.addUint16('kTorchDataInit', rom.getWords(0x84F36A, 144));
  A.addUint16('kTorchDataJunk', rom.getWords(0x84F48a, 48));
}

function buildDefaultAndOverlayRooms(rom: RomData, A: AssetBuilder): void {
  // Default rooms (8)
  const defaultData: number[] = [];
  const defaultOffs = new Array(8).fill(0);
  for (let i = 0; i < 8; i++) {
    const p = 0x84ef2f + i * 3;
    const addr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
    defaultOffs[i] = defaultData.length;
    copyRoomLayer(rom, addr, defaultData);
  }
  A.addUint8('kDungeonRoomDefault', defaultData);
  A.addUint16('kDungeonRoomDefaultOffs', defaultOffs);

  // Overlay rooms (19)
  const overlayData: number[] = [];
  const overlayOffs = new Array(19).fill(0);
  for (let i = 0; i < 19; i++) {
    const p = 0x84ecc0 + i * 3;
    const addr = rom.getByte(p) | (rom.getByte(p + 1) << 8) | (rom.getByte(p + 2) << 16);
    overlayOffs[i] = overlayData.length;
    copyRoomLayer(rom, addr, overlayData);
  }
  A.addUint8('kDungeonRoomOverlay', overlayData);
  A.addUint16('kDungeonRoomOverlayOffs', overlayOffs);
}

// ─── Helpers ───

/** Copy a single room object layer from ROM into output array */
function copyRoomLayer(rom: RomData, addr: number, out: number[]): void {
  let p = addr;
  while (true) {
    const w = rom.getByte(p) | (rom.getByte(p + 1) << 8);
    if (w === 0xffff) { out.push(0xff, 0xff); break; }
    if (w === 0xfff0) { out.push(0xf0, 0xff); p += 2; continue; }
    out.push(rom.getByte(p), rom.getByte(p + 1), rom.getByte(p + 2));
    p += 3;
  }
}

/** Append bytes to a growing array using scan-match deduplication */
function appendScanBytes(big: number[], little: number[]): number {
  for (let n = little.length; n >= 0; n--) {
    if (n === 0) {
      const offset = big.length;
      big.push(...little);
      return offset;
    }
    let match = true;
    for (let k = 0; k < n; k++) {
      if (big[big.length - n + k] !== little[k]) { match = false; break; }
    }
    if (match) {
      const offset = big.length - n;
      big.push(...little.slice(n));
      return offset;
    }
  }
  const offset = big.length;
  big.push(...little);
  return offset;
}

/** LZ decompress with compressed length tracking, using the shared decompressor */
function lzDecompressWithLen(rom: RomData, addr: number): { data: Buffer; compressedLength: number } {
  // Python uses offset_is_be=False for all sprite/bg decompression
  const [data, compressedLength] = lzDecompress(addr, (a) => rom.getByte(a), false, true);
  return { data, compressedLength };
}

// ─── Dialogue ───

function buildDialogue(rom: RomData, A: AssetBuilder): void {
  const lang = 'us';

  // 1. Decode dialogue strings from ROM
  const decoded = decodeStrings((addr) => rom.getByte(addr), lang);
  let texts = decoded.map(d => d.text);

  // US ROM has 396 strings — insert the extra control string at index 4
  if (texts.length === 396) {
    const extraStr = '[Speed 00]0- [Number 00]. 1- [Number 01][2]2- [Number 02]. 3- [Number 03]';
    texts = [...texts.slice(0, 4), extraStr, ...texts.slice(4)];
  }

  // 2. Compress dialogue strings and encode dictionary
  const compressed = compressStrings(texts, lang);
  const dict = encodeDictionary(lang);

  // 3. Pack into nested format: pack([dict_packed, dialogue_packed])
  const dictPacked = packArrays(dict.map(d => Buffer.from(d)));
  const dialoguePacked = packArrays(compressed.map(c => Buffer.from(c)));
  const langData = packArrays([dictPacked, dialoguePacked]);

  // 4. Font data from ROM (2-bit tile format)
  const fontData = Buffer.from(rom.getBytes(0x8E8000, 256 * 16));
  const fontWidth = Buffer.from(rom.getBytes(0x8ECADF, 99));
  const fontPacked = packArrays([fontData, fontWidth]);

  // 5. Language mapping: [langCode, [index, index, flags]]
  const flags = usesNewFormat(lang) ? 1 : 0;
  const mappingData = packArrays([
    Buffer.from(lang, 'utf8'),
    Buffer.from([0, 0, flags]),
  ]);

  A.addPacked('kDialogue', [langData]);
  A.addPacked('kDialogueFont', [fontPacked]);
  A.addPacked('kDialogueMap', [mappingData]);
}

// ─── Sound Banks ───

function buildSoundBanks(rom: RomData, A: AssetBuilder): void {
  // 1. Extract music data from ROM (song texts, SFX, BRR samples, music info)
  const extracted = extractSoundData(rom);

  // 2. For each sound bank, compile and produce the loadable sequence
  for (const song of ['intro', 'indoor', 'ending']) {
    const compiled = compileSoundBank(song, {
      songTexts: extracted.songTexts,
      sfxText: extracted.sfxText,
      brrSamples: extracted.brrSamples,
      musicInfoYaml: extracted.musicInfoYaml,
    });
    const loadableSeq = produceLoadableSeq(compiled.memory);
    A.addUint8(`kSoundBank_${song}`, bufToArr(loadableSeq));
  }
}

// ─── Main entry point ───

interface CompileOptions {
  /** If true, skip dialogue (requires language extraction) */
  skipDialogue?: boolean;
  /** If true, skip sound banks (requires music compiler) */
  skipMusic?: boolean;
}

/**
 * Compile all game assets from ROM into the zelda3_assets.dat binary format.
 * @returns Buffer containing the complete asset file
 */
function compileResources(rom: RomData, options: CompileOptions = {}): Buffer {
  const A = new AssetBuilder();

  if (!options.skipMusic) buildSoundBanks(rom, A);
  buildDungeonRooms(rom, A);
  buildDefaultAndOverlayRooms(rom, A);
  buildDungeonSecrets(rom, A);
  buildDungeonAttrs(rom, A);
  buildEnemyDamageData(rom, A);
  buildLinkGraphics(rom, A);
  buildDungeonSprites(rom, A);
  buildMap32ToMap16(rom, A);
  buildSpriteGfx(rom, A);
  buildBgGfx(rom, A);
  buildMisc(rom, A);
  if (!options.skipDialogue) buildDialogue(rom, A);
  buildDungeonMap(rom, A);
  buildTilemaps(rom, A);
  buildOverworldCompressed(rom, A);
  buildOverworldTables(rom, A);

  return A.serialize();
}

export { compileResources };
export type { CompileOptions };
