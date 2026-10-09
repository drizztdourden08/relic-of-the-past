/* @layer shared-game @kind types */
import type { TraversalRequirement } from '../../navigation/nav-data.types';
import type { DungeonId } from '../../data';
import type { KeyTarget } from '../dungeon-key-target';

interface ReachContext {
  tokens: ReadonlySet<TraversalRequirement>;
  keyAvailable: (dungeon: KeyTarget) => boolean;
  bigKeys: ReadonlySet<DungeonId>;
  events: ReadonlySet<string>;
}

export type { ReachContext };
