/* @layer renderer-widgets @kind logic */
import { getScreenLookup, screenForRoomIndex } from '@rotp/game-data';
import type { ScreenId } from '@rotp/game-data';
import type { ObservedDestKind } from '@rotp/game-core';

const resolveRealDestId = (kind: ObservedDestKind, index: number): ScreenId | null => {
  if (kind === 'screen') return getScreenLookup().byOverworldScreen.get(index)?.id ?? null;
  return screenForRoomIndex(index)?.id ?? null;
};

export { resolveRealDestId };
