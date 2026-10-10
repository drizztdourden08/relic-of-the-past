/* @layer tests @kind helper */
import type { PresenceCondition } from '@rotp/game-data';
import type { Sink } from './record-references.type';

const walkPresence = (condition: PresenceCondition, field: string, take: Sink): void => {
  if ('and' in condition) { for (const sub of condition.and) walkPresence(sub, field, take); return; }
  if ('or' in condition) { for (const sub of condition.or) walkPresence(sub, field, take); return; }
  if ('not' in condition) { walkPresence(condition.not, field, take); return; }
  if ('itemId' in condition) take('item', field, condition.itemId);
};

export { walkPresence };
