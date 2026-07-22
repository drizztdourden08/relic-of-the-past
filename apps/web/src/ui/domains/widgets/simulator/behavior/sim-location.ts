/* @layer renderer-widgets @kind logic */
/**
 * Resolves the engine's virtual screen id to a room-addressable SimLocation so
 * the runner can pull grids / interactables for the screen the virtual Link is
 * exploring — which is not necessarily the screen the real Link stands in.
 */
import type { SimLocation } from '@shared/game/simulation';
import { SCREEN_BY_ID } from '@shared/game/data/screens';

const locationForScreen = (screenId: string): SimLocation | null => {
  const screen = SCREEN_BY_ID.get(screenId);
  if (!screen) return null;
  const isIndoors = screen.type !== 'overworld';
  const roomIndex = screen.roomIndex ?? 0;
  return {
    isIndoors,
    roomId: isIndoors ? roomIndex : 0,
    owScreenIndex: isIndoors ? 0 : roomIndex,
  };
};

export { locationForScreen };
