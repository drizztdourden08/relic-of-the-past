/* @layer tests @kind helper */
import type { SimObservation, FlagSnapshot } from '../../../shared/game/simulation/types';

const baseObs = (screenId: string, flags: FlagSnapshot): SimObservation => ({
  virtual: { screenId, tile: { row: 0, col: 0 } },
  realLocation: { isIndoors: true, roomId: 0, owScreenIndex: 0 },
  inventory: new Set(),
  flags,
  interactables: { chests: [], sprites: [], doors: [] },
});

export { baseObs };
