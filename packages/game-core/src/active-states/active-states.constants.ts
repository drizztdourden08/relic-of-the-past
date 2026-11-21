/* @layer bridge-wasm @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';

const TAGALONG_LABELS: Readonly<Record<number, Message>> = {
  1: msg('game-states:follower.princess'),
  4: msg('game-states:follower.oldMan'),
  5: msg('game-states:follower.uncle'),
  6: msg('game-states:follower.crystalMaiden'),
  7: msg('game-states:follower.frog'),
  9: msg('game-states:follower.locksmith'),
  10: msg('game-states:follower.kiki'),
  12: msg('game-states:follower.purpleChest'),
  13: msg('game-states:follower.superBomb'),
};

const SLOT = {
  progressIndicator: 0,
  progressFlags: 1,
  follower: 13,
  smallKeys: 14,
  bigKey: 15,
} as const;

const NO_KEY_COUNT = 0xff;

const FIRST_REPORTED_TIER = 1;

export { TAGALONG_LABELS, SLOT, NO_KEY_COUNT, FIRST_REPORTED_TIER };
