/* @layer shared-game @kind types */
import type { TraversalRequirement, DungeonId } from '@rotp/game-data';
import type { KeyTarget } from '../dungeon-key-target';

interface ReachContext {
  tokens: ReadonlySet<TraversalRequirement>;
  keyAvailable: (dungeon: KeyTarget) => boolean;
  bigKeys: ReadonlySet<DungeonId>;
  events: ReadonlySet<string>;
}

export type { ReachContext };
