/**
 * Overworld bird travel and whirlpool data compilation.
 */
import type { RomData } from './rom/rom-types';
import type { AssetBuilder } from './asset-builder';
import type { OverworldContext } from './compile-overworld-utils';

function buildOverworldTravel(rom: RomData, A: AssetBuilder, ctx: OverworldContext): void {
  const { isAreaHead } = ctx;

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
}

export { buildOverworldTravel };
