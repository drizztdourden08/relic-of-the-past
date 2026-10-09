/* @layer bridge-wasm @kind logic */
import { wasmGetGameUIState, wasmGetReceiveCount, wasmGetReceiveSite, parseGameUIBuffer } from '@rotp/game-core';
import { dungeonGroupName, dungeonGroupOf } from '@rotp/game-data';
import {
  DUNGEON_BIT_TOP, DUNGEON_SLOTS, ITEM_ID_COUNT, PER_HEART, RECEIVE_SITES,
} from './read-loadout.constants';
import type { DungeonItems, Loadout } from './read-loadout.type';

const hasDungeonBit = (field: number, dungeonIndex: number): boolean =>
  ((field << dungeonIndex) & DUNGEON_BIT_TOP) !== 0;

const collectDungeonItems = (maps: number, compasses: number, bigKeys: number): DungeonItems[] => {
  const out: DungeonItems[] = [];
  for (let dungeonIndex = 0; dungeonIndex < DUNGEON_SLOTS; dungeonIndex++) {
    const map = hasDungeonBit(maps, dungeonIndex);
    const compass = hasDungeonBit(compasses, dungeonIndex);
    const bigKey = hasDungeonBit(bigKeys, dungeonIndex);
    if (!map && !compass && !bigKey) continue;
    out.push({ dungeonIndex, name: dungeonGroupName(dungeonGroupOf(dungeonIndex << 1)), map, compass, bigKey });
  }
  return out;
};

const readGrants = (): Loadout['grants'] => ({
  byItem: Object.fromEntries(Array.from({ length: ITEM_ID_COUNT }, (_, id) => [id, wasmGetReceiveCount(id)] as const)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => [`0x${Number(id).toString(16).padStart(2, '0')}`, n])),
  bySite: RECEIVE_SITES.map((i) => wasmGetReceiveSite(i)),
});

const readLoadout = (): Loadout | null => {
  const ui = wasmGetGameUIState();
  if (!ui) return null;
  const { hud, equipment, dungeonProgress } = parseGameUIBuffer(ui.heap, ui.ptr);
  return {
    hearts: {
      current: hud.healthCurrent / PER_HEART,
      capacity: hud.healthCapacity / PER_HEART,
      pieces: equipment.heartPieces,
    },
    magic: { current: hud.magicPower, halfMagic: hud.halfMagic },
    equipment: {
      sword: equipment.sword,
      shield: equipment.shield,
      armor: equipment.armor,
      gloves: equipment.gloves,
      boots: equipment.boots !== 0,
      flippers: equipment.flippers !== 0,
      moonPearl: equipment.moonPearl !== 0,
    },
    consumables: { rupees: hud.rupeeTarget, bombs: hud.bombs, arrows: hud.arrows },
    smallKeysHere: hud.keys,
    dungeonItems: collectDungeonItems(dungeonProgress.maps, dungeonProgress.compasses, dungeonProgress.bigKeys),
    quest: { pendants: dungeonProgress.pendants, crystals: dungeonProgress.crystals },
    grants: readGrants(),
  };
};

export { readLoadout };
export type { Loadout, DungeonItems } from './read-loadout.type';
