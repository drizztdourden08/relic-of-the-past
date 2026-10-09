/* @layer renderer-widgets @kind hook */
import { useMemo } from 'react';
import { wasmGetRoomSpriteSpawns, wasmGetOverworldSpriteSpawns, wasmGetSpriteCombat } from '@app/lib/game';
import type { LiveSpriteObservation, SpriteCombatObservation } from '@rotp/game-core';
import type { SpriteLiveObservations } from '../LiveDataInspector.type';

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
