/* @layer bridge-wasm @kind logic */
/**
 * The combat sweep's verdict on a probed room's gating sprites, split out of
 * probe-room.ts to keep that file under the line budget. See enemy-reach.ts
 * for what "gating" and "clearable" mean.
 */
import type { CombatContext, RoomSectionSplit } from '@shared/game/simulation';
import { evaluateRoomThreat } from '@shared/game/simulation/engine/enemy-reach';
import { wasmGetSpriteCombat, wasmGetCombatTables, wasmGetRoomLayoutInfo, roomSectionSplitFrom } from '../';
import { getCurrentInventory } from '../tracker';
import { getRoomSprites } from './interactables';
import { getScreenGrids } from '../flood';
import { readMapState } from './read-game-state';
import type { RoomFloodRun } from './flood-room';

interface RoomThreatProbe {
  /** The LIVE tracker inventory at probe time (not a simulated virtual-run
   *  inventory) — a room probed before picking anything up reads every
   *  sprite as `no-weapon` by design. */
  inventory: string[];
  clearable: boolean;
  gating: Array<{ type: string; killable: boolean; weapon?: string; blockedBy?: string }>;
}

/** Combat context for a room's sprites, built the same way the runner's
 *  combatFor does (observe.ts) but reading straight off the bridge — the probe
 *  runs without a SimulatorPort. */
const combatForProbe = (spriteTypes: number[]): CombatContext => {
  const bySpriteType: CombatContext['bySpriteType'] = {};
  for (const spriteType of new Set(spriteTypes)) bySpriteType[spriteType] = wasmGetSpriteCombat(spriteType);
  return { tables: wasmGetCombatTables(), bySpriteType };
};

/** The room's section split, only trustworthy when the player is actually
 *  standing in the probed room (the layout read is live-only — see
 *  WasmGetRoomLayoutInfo). A remote probe gets no split, so every gating
 *  sprite counts, same as a plain single-section room. */
const splitForProbe = (roomId: number): RoomSectionSplit | undefined => {
  const live = readMapState();
  return live?.isIndoors && live.roomIndex === roomId ? roomSectionSplitFrom(wasmGetRoomLayoutInfo()) : undefined;
};

const probeRoomThreat = (roomId: number, run: RoomFloodRun | null): RoomThreatProbe => {
  const sprites = getRoomSprites(roomId);
  const reached = Array.from({ length: 64 }, (_, r) =>
    Array.from({ length: 64 }, (_, c) => (run?.result.reachable[r]?.[c] ?? 0) > 0));
  const grids = getScreenGrids({ isIndoors: true, roomId, owScreenIndex: 0 });
  const combat = combatForProbe(sprites.map((s) => s.spriteType));
  const inventory = new Set(getCurrentInventory());
  const evaluated = evaluateRoomThreat({ sprites, reached, grids, inventory, combat, split: splitForProbe(roomId) });
  return {
    inventory: [...inventory],
    clearable: evaluated.clearable,
    gating: evaluated.gating.map((g) => ({
      type: `0x${g.sprite.spriteType.toString(16)}`,
      killable: g.killable,
      ...(g.by ? { weapon: g.by.label } : {}),
      ...(g.blockedBy ? { blockedBy: g.blockedBy } : {}),
    })),
  };
};

export { probeRoomThreat };
export type { RoomThreatProbe };
