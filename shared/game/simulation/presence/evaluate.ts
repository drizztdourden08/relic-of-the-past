/* @layer shared-game @kind logic */
/**
 * evaluatePresence — pure evaluation of a declarative PresenceCondition against
 * a PresenceGameState snapshot. This is the sim's ONE sanctioned data read: the
 * transcribed spawn conditions live as data on the checks (see
 * CheckRecord.presence) and this function reads them. An absent condition means
 * "always present". An `itemId` leaf is asked of the inventory directly — it used
 * to resolve to a display name first, purely because the engine's inventory was a
 * name set.
 */
import type { BitState, PresenceCondition } from '../../data';
import type { PresenceGameState } from './state';

/** save_dung_info bit marking a room's boss defeated / room cleared. */
const BOSS_DEAD_BIT = 0x8000;

const bitMatches = (value: number, mask: number, state: BitState): boolean => {
  const present = (value & mask) !== 0;
  return state === 'set' ? present : !present;
};

const evaluatePresence = (condition: PresenceCondition | undefined, state: PresenceGameState): boolean => {
  if (!condition) return true;

  if ('progressFlag' in condition) return bitMatches(state.progressFlags, condition.progressFlag, condition.state);
  if ('progressIndicator3' in condition) {
    return bitMatches(state.progressIndicator3, condition.progressIndicator3, condition.state);
  }
  if ('itemId' in condition) return state.inventory.has(condition.itemId) === condition.owned;
  if ('follower' in condition) return state.followerIndicator === 0;
  if ('followerEq' in condition) return state.followerIndicator === condition.followerEq;
  if ('owEvent' in condition) {
    return bitMatches(state.owEventInfo[condition.owEvent.screen] ?? 0, condition.owEvent.mask, condition.state);
  }
  if ('roomBossDead' in condition) {
    const dead = ((state.roomState[condition.roomBossDead] ?? 0) & BOSS_DEAD_BIT) !== 0;
    return dead === condition.dead;
  }
  if ('and' in condition) return condition.and.every((c) => evaluatePresence(c, state));
  if ('or' in condition) return condition.or.some((c) => evaluatePresence(c, state));
  return !evaluatePresence(condition.not, state);
};

export { evaluatePresence, BOSS_DEAD_BIT };
