/* @layer shared-game @kind logic */
import type { SimObservation } from '../../types';
import { FOLLOWER_INDICATOR_SLOT } from '../../presence/presence.constants';
import { FOLLOWER_IN_TOW } from './discover.constants';

const followerInTow = (obs: SimObservation): boolean => (obs.flags.progress[FOLLOWER_INDICATOR_SLOT] ?? 0) === FOLLOWER_IN_TOW;

export { followerInTow };
