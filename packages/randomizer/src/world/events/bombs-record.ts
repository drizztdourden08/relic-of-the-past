/* @layer shared-game @kind logic */
import { BOMBS_HELD_CHECK } from './bombs-record.constants';
import type { CollectionState } from '../collection-state';

const bombsEverHeld = (state: CollectionState): boolean =>
  state.world.options.actTokens === undefined || state.has(BOMBS_HELD_CHECK);

export { bombsEverHeld };
