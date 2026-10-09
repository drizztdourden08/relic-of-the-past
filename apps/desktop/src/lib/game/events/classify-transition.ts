/* @layer bridge-wasm @kind logic */
import type { TransitionKind } from './transition-events.type';
import {
  DOOR_SUBMODULES, DUNGEON_MODULE, QUADRANT_SUBMODULES, ROOM_SUBMODULES, STAIR_SUBMODULES, SUBMODULE_NONE,
} from './classify-transition.constants';

const classifyTransition = (module: number, fromSubmodule: number): TransitionKind => {
  if (fromSubmodule === SUBMODULE_NONE) return 'entered';
  if (module !== DUNGEON_MODULE) return 'other';
  if (ROOM_SUBMODULES.has(fromSubmodule)) return 'room';
  if (QUADRANT_SUBMODULES.has(fromSubmodule)) return 'quadrant';
  if (DOOR_SUBMODULES.has(fromSubmodule)) return 'doors';
  if (STAIR_SUBMODULES.has(fromSubmodule)) return 'stairs';
  return 'other';
};

export { classifyTransition };
