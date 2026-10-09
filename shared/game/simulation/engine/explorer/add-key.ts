/* @layer shared-game @kind logic */
import type { DungeonId } from '../../../data';
import type { EngineState } from '../state/state.type';

const addKey = (state: EngineState, dungeon: DungeonId): void => {
  state.keys.set(dungeon, (state.keys.get(dungeon) ?? 0) + 1);
};

export { addKey };
