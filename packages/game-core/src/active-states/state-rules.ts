/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { progressTierLabel } from '@rotp/game-data';
import type { StateRule } from './active-states.type';
import { FIRST_REPORTED_TIER, NO_KEY_COUNT, SLOT, TAGALONG_LABELS } from './active-states.constants';

const followerRule: StateRule = (snap) => {
  if (!snap.follower) return null;
  const label = TAGALONG_LABELS[snap.follower];
  if (label) return { id: 'follower', label, gating: true };
  return {
    id: 'follower',
    label: msg('game-states:follower.unmapped', { id: snap.follower }),
    detail: msg('game-states:follower.unmappedDetail'),
    gating: true,
  };
};

const bigKeyRule: StateRule = (snap) => (snap.progress[SLOT.bigKey]
  ? { id: 'big-key', label: msg('game-states:bigKey'), gating: true }
  : null);

const smallKeyRule: StateRule = (snap) => {
  const keys = snap.progress[SLOT.smallKeys] ?? 0;
  if (keys === 0 || keys === NO_KEY_COUNT) return null;
  return { id: 'small-keys', label: msg('game-states:smallKeys', { count: keys }), gating: true };
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
