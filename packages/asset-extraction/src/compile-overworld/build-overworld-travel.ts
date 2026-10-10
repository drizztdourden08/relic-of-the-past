/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import type { AssetBuilder } from '../asset-builder';
import type { OverworldContext } from './build-overworld-context.type';
import type { TravelEntry } from './build-overworld-travel.type';
import { BIRD_TRAVEL_COUNT, TRAVEL_SLOT_COUNT, TRAVEL_TABLES } from './build-overworld-travel.constants';

const readTravelEntries = (rom: RomData): Map<number, TravelEntry[]> => {
  const travelByArea = new Map<number, TravelEntry[]>();
  for (let i = 0; i < TRAVEL_SLOT_COUNT; i++) {
    const screenIndex = rom.getWord(0x82eae5 + i * 2);
    const entry: TravelEntry = i < BIRD_TRAVEL_COUNT
      ? { romIndex: i, birdTravelId: i }
      : { romIndex: i, whirlpoolSrcArea: rom.getWord(0x82ecf8 + (i - BIRD_TRAVEL_COUNT) * 2) };
    const entries = travelByArea.get(screenIndex) ?? [];
    travelByArea.set(screenIndex, entries);
    entries.push(entry);
  }
  return travelByArea;
};

const writeTravelRow = (rom: RomData, tables: number[][], slot: number, romIndex: number): void => {
  for (const [k, { base, signed }] of TRAVEL_TABLES.entries()) {
    const table = tables[k];
    if (!table) continue;
    const at = base + romIndex * 2;
    table[slot] = signed ? rom.getInt8(at) : rom.getWord(at);
  }
};

const addTravelTables = (A: AssetBuilder, tables: number[][]): void => {
  for (const [k, { asset, signed }] of TRAVEL_TABLES.entries()) {
    const table = tables[k] ?? [];
    if (signed) A.addInt8(asset, table);
    else A.addUint16(asset, table);
  }
};

const buildOverworldTravel = (rom: RomData, A: AssetBuilder, ctx: OverworldContext): void => {
  const { isAreaHead } = ctx;
  const screenIndices = new Array<number>(TRAVEL_SLOT_COUNT).fill(0);
  const tables = TRAVEL_TABLES.map(() => new Array<number>(TRAVEL_SLOT_COUNT).fill(0));
  const whirlpoolAreas = new Array<number>(8).fill(0);
  const travelByArea = readTravelEntries(rom);

  let nextWhirlpoolId = 0;
  for (let i = 0; i < 160; i++) {
    if (!isAreaHead(i)) continue;
    for (const t of travelByArea.get(i) ?? []) {
      let slot: number;
      if ('birdTravelId' in t) {
        slot = t.birdTravelId;
      } else {
        whirlpoolAreas[nextWhirlpoolId] = t.whirlpoolSrcArea;
        slot = nextWhirlpoolId + BIRD_TRAVEL_COUNT;
        nextWhirlpoolId++;
      }
      screenIndices[slot] = i;
      writeTravelRow(rom, tables, slot, t.romIndex);
    }
  }

  A.addUint16('kBirdTravel_ScreenIndex', screenIndices);
  addTravelTables(A, tables);
  A.addUint16('kWhirlpoolAreas', whirlpoolAreas);
};

export { buildOverworldTravel };
