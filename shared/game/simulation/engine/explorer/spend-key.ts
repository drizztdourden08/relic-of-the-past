/* @layer shared-game @kind logic */
import type { DungeonId } from '../../../data';
import type { EngineState } from '../state/state.type';

const spendKey = (state: EngineState, dungeon: DungeonId): boolean => {
  const remaining = state.keys.get(dungeon) ?? 0;
  if (remaining <= 0) return false;
  state.keys.set(dungeon, remaining - 1);
  return true;
};

export { spendKey };
