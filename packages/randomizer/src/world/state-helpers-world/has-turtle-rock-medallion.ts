/* @layer shared-game @kind logic */
import type { CollectionState } from '../collection-state.type';

const hasTurtleRockMedallion = (state: CollectionState): boolean =>
  state.has(state.world.options.medallions.turtleRock);

export { hasTurtleRockMedallion };
