/* @layer shared-game @kind logic */
import type { CollectionState } from '../collection-state.type';

const hasMireMedallion = (state: CollectionState): boolean =>
  state.has(state.world.options.medallions.mire);

export { hasMireMedallion };
