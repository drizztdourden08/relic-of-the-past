/* @layer shared-game @kind logic */
import type { DungeonId } from '../../data';
import type { KeyTarget } from './dungeon-key-target.type';
import { ANY_DUNGEON } from './dungeon-key-target.constants';

const isDungeonId = (value: string): value is DungeonId => value.startsWith('dungeon-');

const keyTargetOf = (suffix: string): KeyTarget | null => {
  if (suffix === ANY_DUNGEON) return ANY_DUNGEON;
  return isDungeonId(suffix) ? suffix : null;
};

export { keyTargetOf };
