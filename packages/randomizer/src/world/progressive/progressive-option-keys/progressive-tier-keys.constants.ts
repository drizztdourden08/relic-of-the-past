/* @layer shared-game @kind constants */
import { PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import { progressiveTierKeysOf } from './progressive-tier-keys-of';

const PROGRESSIVE_TIER_KEYS: readonly string[] =
  PROGRESSIVE_FAMILIES.flatMap((family) => progressiveTierKeysOf(family.id));

const PROGRESSIVE_TIER_KEY_SET: ReadonlySet<string> = new Set(PROGRESSIVE_TIER_KEYS);

export { PROGRESSIVE_TIER_KEYS, PROGRESSIVE_TIER_KEY_SET };
