/* @layer shared-game @kind logic */
import type { RandomizerOptionsSnapshot } from '../../options.type';

const shufflePrizesFromSnapshot = (snapshot: RandomizerOptionsSnapshot): boolean =>
  snapshot.values['dungeon_prize_shuffle'] !== false;

export { shufflePrizesFromSnapshot };
