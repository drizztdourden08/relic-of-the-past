/* @layer bridge-wasm @kind logic */
import { progressTierLabel } from '@shared/game/logic/queries/progress-tier';
import type { StateRule } from './active-states.type';
import { FIRST_REPORTED_TIER, NO_KEY_COUNT, SLOT, TAGALONG_NAMES } from './active-states.constants';

const followerRule: StateRule = (snap) => {
  if (!snap.follower) return null;
  const name = TAGALONG_NAMES[snap.follower];
  return {
    id: 'follower',
    label: name ? `${name} following` : `Follower #${snap.follower} following`,
    ...(name ? {} : { detail: 'unmapped tagalong id' }),
    gating: true,
  };
};

const bigKeyRule: StateRule = (snap) => (snap.progress[SLOT.bigKey]
  ? { id: 'big-key', label: 'Big key held', gating: true }
  : null);

const smallKeyRule: StateRule = (snap) => {
  const keys = snap.progress[SLOT.smallKeys] ?? 0;
  if (keys === 0 || keys === NO_KEY_COUNT) return null;
  return { id: 'small-keys', label: `${keys} small key${keys > 1 ? 's' : ''}`, gating: true };
};

const progressRule: StateRule = (snap) => {
  const tier = snap.progress[SLOT.progressIndicator] ?? 0;
  if (tier < FIRST_REPORTED_TIER) return null;
  const label = progressTierLabel(tier);
  return label ? { id: `progress-${tier}`, label } : null;
};

const stateRules: readonly StateRule[] = [
  followerRule, progressRule, bigKeyRule, smallKeyRule,
];

export { stateRules };
