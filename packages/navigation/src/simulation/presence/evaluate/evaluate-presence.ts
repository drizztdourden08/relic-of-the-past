/* @layer shared-game @kind logic */
import type { BitState, PresenceCondition } from '@rotp/game-data';
import type { PresenceGameState } from '../presence.type';
import { BOSS_DEAD_BIT } from '../presence.constants';

const bitMatches = (value: number, mask: number, state: BitState): boolean => {
  const present = (value & mask) !== 0;
  return state === 'set' ? present : !present;
};

const evaluateProgressAndHolder = (condition: PresenceCondition, state: PresenceGameState): boolean | undefined => {
  if ('progressFlag' in condition) return bitMatches(state.progressFlags, condition.progressFlag, condition.state);
  if ('progressIndicator3' in condition) {
    return bitMatches(state.progressIndicator3, condition.progressIndicator3, condition.state);
  }
  if ('itemId' in condition) return state.inventory.has(condition.itemId) === condition.owned;
  if ('follower' in condition) return state.followerIndicator === 0;
  if ('followerEq' in condition) return state.followerIndicator === condition.followerEq;
  return undefined;
};

const evaluateWorldBytes = (condition: PresenceCondition, state: PresenceGameState): boolean | undefined => {
  if ('owEvent' in condition) {
    return bitMatches(state.owEventInfo[condition.owEvent.screen] ?? 0, condition.owEvent.mask, condition.state);
  }
  if ('roomBossDead' in condition) {
    const dead = ((state.roomState[condition.roomBossDead] ?? 0) & BOSS_DEAD_BIT) !== 0;
    return dead === condition.dead;
  }
  if ('progressIndicatorEq' in condition) return state.progressIndicator === condition.progressIndicatorEq;
  if ('progressIndicatorLt' in condition) return state.progressIndicator < condition.progressIndicatorLt;
  return undefined;
};

const evaluateLinkStatus = (condition: PresenceCondition, state: PresenceGameState): boolean | undefined => {
  if ('darkWorld' in condition) return (state.status?.darkWorld ?? false) === condition.darkWorld;
  if ('bunny' in condition) return (state.status?.bunny ?? false) === condition.bunny;
  return undefined;
};

const evaluateStatus = (condition: PresenceCondition, state: PresenceGameState): boolean | undefined => {
  const link = evaluateLinkStatus(condition, state);
  if (link !== undefined) return link;
  if ('crystalSwitchFlipped' in condition) return (state.status?.crystalSwitchFlipped ?? false) === condition.crystalSwitchFlipped;
  if ('desertStatuesMoved' in condition) return (state.status?.desertStatuesMoved ?? false) === condition.desertStatuesMoved;
  return undefined;
};

const evaluatePresence = (condition: PresenceCondition | undefined, state: PresenceGameState): boolean => {
  if (!condition) return true;
  const leaf = evaluateProgressAndHolder(condition, state) ?? evaluateWorldBytes(condition, state) ?? evaluateStatus(condition, state);
  if (leaf !== undefined) return leaf;
  if ('and' in condition) return condition.and.every((c) => evaluatePresence(c, state));
  if ('or' in condition) return condition.or.some((c) => evaluatePresence(c, state));
  return !evaluatePresence('not' in condition ? condition.not : undefined, state);
};

export { evaluatePresence };
