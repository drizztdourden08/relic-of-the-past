/* @layer shared-game @kind constants */
import { PROGRESSIVE_FAMILIES } from '../progressive-families.constants';
import { progressiveModeKeyOf } from './progressive-mode-key-of';

const PROGRESSIVE_MODE_KEYS: readonly string[] =
  PROGRESSIVE_FAMILIES.map((family) => progressiveModeKeyOf(family.id));

const PROGRESSIVE_MODE_KEY_SET: ReadonlySet<string> = new Set(PROGRESSIVE_MODE_KEYS);

export { PROGRESSIVE_MODE_KEYS, PROGRESSIVE_MODE_KEY_SET };
