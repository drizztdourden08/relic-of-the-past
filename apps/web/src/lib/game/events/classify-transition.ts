/* @layer bridge-wasm @kind logic */
/** Maps the raw (module, fromSubmodule) pair the core reports to a TransitionKind. */
import type { TransitionKind } from './transition-events.type';

const QUADRANT_SUBMODULES: ReadonlySet<number> = new Set([1]);
const ROOM_SUBMODULES: ReadonlySet<number> = new Set([2]);
const DOOR_SUBMODULES: ReadonlySet<number> = new Set([4, 5, 9]);
const STAIR_SUBMODULES: ReadonlySet<number> = new Set([6, 8, 0x0E, 0x10, 0x11, 0x12, 0x13]);

const DUNGEON_MODULE = 7;

const classifyTransition = (module: number, fromSubmodule: number): TransitionKind => {
  if (fromSubmodule === 0) return 'entered';
  if (module !== DUNGEON_MODULE) return 'other';
  if (ROOM_SUBMODULES.has(fromSubmodule)) return 'room';
  if (QUADRANT_SUBMODULES.has(fromSubmodule)) return 'quadrant';
  if (DOOR_SUBMODULES.has(fromSubmodule)) return 'doors';
  if (STAIR_SUBMODULES.has(fromSubmodule)) return 'stairs';
  return 'other';
};

export { classifyTransition };
