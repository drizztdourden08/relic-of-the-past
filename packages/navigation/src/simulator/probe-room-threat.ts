/* @layer bridge-wasm @kind logic */
import type { CombatContext } from '../simulation/types/combat.type';
import type { RoomSectionSplit } from '@rotp/game-core';
import { evaluateRoomThreat } from '../simulation/engine/enemy-reach';
import { wasmGetSpriteCombat, wasmGetCombatTables, wasmGetRoomLayoutInfo, roomSectionSplitFrom } from '@rotp/game-core';
import { getCurrentInventory } from '../tracker/bridge/get-current-inventory';
import { getRoomSprites } from './interactables';
import { getScreenGrids } from '../flood/screen-grids';
import { readMapState } from '@rotp/game-core';
import type { RoomFloodRun } from './flood-room';
import type { RoomThreatProbe } from './probe-room-threat.type';

const combatForProbe = (spriteTypes: number[]): CombatContext => {
  const bySpriteType: CombatContext['bySpriteType'] = {};
  for (const spriteType of new Set(spriteTypes)) bySpriteType[spriteType] = wasmGetSpriteCombat(spriteType);
  return { tables: wasmGetCombatTables(), bySpriteType };
};

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
  const evaluated = evaluateRoomThreat({
    sprites, reached, grids, combat, split: splitForProbe(roomId), inventory,
  });
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
export type { RoomThreatProbe } from './probe-room-threat.type';
