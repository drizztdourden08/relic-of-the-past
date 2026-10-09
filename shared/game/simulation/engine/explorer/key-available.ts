/* @layer shared-game @kind logic */
import { ANY_DUNGEON } from '../../dungeon-key-target';
import type { KeyTarget } from '../../dungeon-key-target';
import type { EngineState } from '../state/state.type';

const keyAvailable = (state: EngineState, dungeon: KeyTarget): boolean => {
  if (dungeon === ANY_DUNGEON) return [...state.keys.values()].some(n => n > 0);
  return (state.keys.get(dungeon) ?? 0) > 0;
};

export { keyAvailable };
