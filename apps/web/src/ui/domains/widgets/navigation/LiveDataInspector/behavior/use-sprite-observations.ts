/* @layer renderer-widgets @kind hook */
/**
 * `liveSprites`/`spriteCombat` for the current screen — the actor-facing half
 * of `ScreenObservations`. Read directly off the room-addressable simulator
 * queries (`wasmGetRoomSpriteSpawns`/`wasmGetOverworldSpriteSpawns`), which
 * already report `{spriteType, col, row, floor}` per spawn — the same shape
 * `LiveSpriteObservation` wants, so the raw rows pass straight through.
 * `spriteCombat` resolves one native row per DISTINCT sprite type spawned
 * here, never per spawn instance, keeping the wasm call count bounded by how
 * many kinds of actor share the room rather than how many copies are on it.
 */
import { useMemo } from 'react';
import { wasmGetRoomSpriteSpawns, wasmGetOverworldSpriteSpawns, wasmGetSpriteCombat } from '@app/lib/game';
import type { LiveSpriteObservation, SpriteCombatObservation } from '@shared/game/recommendations';

interface SpriteLiveObservations {
  liveSprites: readonly LiveSpriteObservation[];
  spriteCombat: Readonly<Record<number, SpriteCombatObservation>>;
}

const useSpriteObservations = (isIndoors: boolean, roomIndex: number, overworldScreenIndex: number): SpriteLiveObservations => {
  const liveSprites = useMemo<readonly LiveSpriteObservation[]>(
    () => (isIndoors ? wasmGetRoomSpriteSpawns(roomIndex) : wasmGetOverworldSpriteSpawns(overworldScreenIndex)) ?? [],
    [isIndoors, roomIndex, overworldScreenIndex],
  );

  const spriteCombat = useMemo<Readonly<Record<number, SpriteCombatObservation>>>(() => {
    const byType: Record<number, SpriteCombatObservation> = {};
    const seen = new Set<number>();
    for (const spawn of liveSprites) {
      if (seen.has(spawn.spriteType)) continue;
      seen.add(spawn.spriteType);
      const combat = wasmGetSpriteCombat(spawn.spriteType);
      if (combat) byType[spawn.spriteType] = combat;
    }
    return byType;
  }, [liveSprites]);

  return { liveSprites, spriteCombat };
};

export { useSpriteObservations };
export type { SpriteLiveObservations };
