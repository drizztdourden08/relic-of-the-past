/* @layer bridge-wasm @kind logic */
/**
 * The player's full loadout, read from the game rather than tallied by the run.
 *
 * The run's own inventory is a set of check names, which answers "what did the
 * run collect" but not "what does the player actually have": it carries no
 * hearts, no equipment tiers, and no per-dungeon map/compass/key state. Those
 * live in the save and the game already decodes them for the HUD, so this reads
 * the same buffer the HUD does.
 *
 * Tiers stay NUMBERS here. The display layer decides what to call a tier-2
 * sword; naming it in code would put the game's own product names into the
 * repository, which the copyright gate exists to prevent.
 */
import { wasmGetGameUIState, wasmGetReceiveCount, wasmGetReceiveSite } from '../';
import { parseGameUIBuffer } from '../ui-bridge';
import { dungeonGroupName, dungeonGroupOf } from '@shared/game/data/screens/dungeon-group';

/** Health is stored in eighths of a heart. */
const PER_HEART = 8;

/** How many dungeons the map/compass/big-key bitfields cover. */
const DUNGEON_SLOTS = 16;

interface DungeonItems {
  /** `palaceIndex >> 1` — how the game's own dungeon tables index. */
  dungeonIndex: number;
  /** Display only, resolved from the screen data. */
  name: string;
  map: boolean;
  compass: boolean;
  bigKey: boolean;
}

interface Loadout {
  hearts: { current: number; capacity: number; pieces: number };
  magic: { current: number; halfMagic: boolean };
  /** 0 means "not held"; higher is a better tier of the same slot. */
  equipment: {
    sword: number; shield: number; armor: number;
    gloves: number; boots: boolean; flippers: boolean; moonPearl: boolean;
  };
  consumables: { rupees: number; bombs: number; arrows: number };
  /** The game keeps ONE small-key counter, for the dungeon being stood in. */
  smallKeysHere: number;
  dungeonItems: DungeonItems[];
  quest: { pendants: number; crystals: number };
  /** Diagnostic: how many times the game was actually told to hand over an item.
   *  Link_ReceiveItem is not idempotent, so a count above the number of checks
   *  taken means something granted twice. Sites: 0 chest, 1 npc, 2 overworld, 3 kill. */
  grants: { byItem: Record<string, number>; bySite: number[] };
}

/** Bit test the game's own way (`hud.c`: `field << dungeonIndex & 0x8000`), so
 *  the slot order cannot drift from what the HUD draws. */
const hasDungeonBit = (field: number, dungeonIndex: number): boolean =>
  ((field << dungeonIndex) & 0x8000) !== 0;

/** Only report a dungeon the player has something for — the full sixteen slots
 *  are mostly empty this early and would bury the ones that matter. */
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

/** Everything the player is carrying, or null when the game is not readable. */
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
    // The GOAL, not the displayed counter. The HUD ticks `link_rupees_actual` up
    // toward `link_rupees_goal` a few per frame (hud.c:389), so a run that ends
    // while the counter is still climbing reports less than the player owns.
    consumables: { rupees: hud.rupeeTarget, bombs: hud.bombs, arrows: hud.arrows },
    smallKeysHere: hud.keys,
    dungeonItems: collectDungeonItems(dungeonProgress.maps, dungeonProgress.compasses, dungeonProgress.bigKeys),
    quest: { pendants: dungeonProgress.pendants, crystals: dungeonProgress.crystals },
    grants: {
      byItem: Object.fromEntries(Array.from({ length: 256 }, (_, id) => [id, wasmGetReceiveCount(id)] as const)
        .filter(([, n]) => n > 0)
        .map(([id, n]) => [`0x${Number(id).toString(16).padStart(2, '0')}`, n])),
      bySite: [0, 1, 2, 3].map((i) => wasmGetReceiveSite(i)),
    },
  };
};

export { readLoadout };
export type { Loadout, DungeonItems };
