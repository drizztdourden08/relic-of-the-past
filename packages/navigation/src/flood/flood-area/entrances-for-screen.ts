/* @layer bridge-wasm @kind logic */
import type { OverworldEntrance } from '@rotp/game-core';
import { roomEntrances } from '../room-entrances';

const entrancesForScreen = (
  isIndoors: boolean,
  primaryScreenIndex: number,
  primaryEntrances: OverworldEntrance[],
): ((screenIndex: number) => OverworldEntrance[]) => {
  const cache = new Map<number, OverworldEntrance[]>();
  return (screenIndex) => {
    if (!isIndoors || screenIndex === primaryScreenIndex) return primaryEntrances;
    const cached = cache.get(screenIndex);
    if (cached) return cached;
    const fresh = roomEntrances(screenIndex);
    cache.set(screenIndex, fresh);
    return fresh;
  };
};

export { entrancesForScreen };
