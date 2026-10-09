/* @layer shared-game @kind logic */
import { dungeonGroupForScreen } from '@rotp/game-data';
import type { EngineState } from '../state/state.type';

const inCompletedGroup = (state: EngineState, screenId: string): boolean => {
  const group = dungeonGroupForScreen(screenId);
  if (group == null) return false;
  return state.ledgers.get(group)?.complete === true;
};

export { inCompletedGroup };
