/* @layer shared-game @kind logic */
import { PROGRESSIVE_TIER_KEY_SET } from './progressive-tier-keys.constants';

const isProgressiveTierKey = (key: string): boolean => PROGRESSIVE_TIER_KEY_SET.has(key);

export { isProgressiveTierKey };
