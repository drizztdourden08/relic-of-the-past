/* @layer renderer-widgets @kind logic */
import { getScreenLookup } from '@shared/game/logic/queries/detection';
import { screenForRoomIndex } from '@shared/game/logic/queries/room-screen';
import type { ScreenId } from '@shared/game/data';
import type { ObservedDestKind } from '@shared/game/recommendations';

const resolveRealDestId = (kind: ObservedDestKind, index: number): ScreenId | null => {
  if (kind === 'screen') return getScreenLookup().byOverworldScreen.get(index)?.id ?? null;
  return screenForRoomIndex(index)?.id ?? null;
};

export { resolveRealDestId };
