/* @layer shared-game @kind logic */
import type { ReachState } from '../../../navigation/types';
import type { CheckId, ItemId } from '../../../data';
import type { BossSite } from './boss-gate.type';
import { isReachable } from './is-reachable';
import { meetsRequirements } from './meets-requirements';

const bossTriggerable = (boss: BossSite, reach: ReachState[][], inv: ReadonlySet<ItemId>, completed: ReadonlySet<CheckId>): boolean =>
  isReachable(reach, boss.triggerTile) && meetsRequirements(boss.beatableWith, inv, completed);

export { bossTriggerable };
