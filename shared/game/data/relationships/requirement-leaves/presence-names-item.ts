/* @layer shared-game @kind logic */
import type { PresenceCondition } from '../../types';

const presenceNamesItem = (condition: PresenceCondition, id: string): boolean => {
  if ('and' in condition) return condition.and.some(sub => presenceNamesItem(sub, id));
  if ('or' in condition) return condition.or.some(sub => presenceNamesItem(sub, id));
  if ('not' in condition) return presenceNamesItem(condition.not, id);
  return 'itemId' in condition && condition.itemId === id;
};

export { presenceNamesItem };
