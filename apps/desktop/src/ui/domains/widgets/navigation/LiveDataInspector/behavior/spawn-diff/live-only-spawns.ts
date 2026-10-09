/* @layer renderer-widgets @kind logic */
import type { ScreenSpawn } from '@shared/game/data';
import type { Difference } from '@shared/game/recommendations';
import { spawnKey } from './spawn-key';

const liveOnlySpawns = (spawns: readonly ScreenSpawn[], diff: Difference | undefined): readonly ScreenSpawn[] => {
  if (!diff || !Array.isArray(diff.liveValue)) return [];
  const known = new Set(spawns.map(spawnKey));
  return (diff.liveValue as ScreenSpawn[]).filter((spawn) => !known.has(spawnKey(spawn)));
};

export { liveOnlySpawns };
