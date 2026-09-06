/* @layer shared-game @kind logic */
/**
 * The catalog keys the per-family mode rows occupy, derived from the family
 * table so a family added to the data brings its row with it. One key per
 * family, naming the FAMILY and never a tier, so the key survives any change
 * to the ladder underneath it.
 */
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import type { ProgressiveFamilyId } from './progressive.type';

const progressiveModeKeyOf = (family: ProgressiveFamilyId): string => `progressive_mode_${family}`;

const PROGRESSIVE_MODE_KEYS: readonly string[] =
  PROGRESSIVE_FAMILIES.map((family) => progressiveModeKeyOf(family.id));

const PROGRESSIVE_MODE_KEY_SET: ReadonlySet<string> = new Set(PROGRESSIVE_MODE_KEYS);

const isProgressiveModeKey = (key: string): boolean => PROGRESSIVE_MODE_KEY_SET.has(key);

export {
  PROGRESSIVE_MODE_KEYS,
  PROGRESSIVE_MODE_KEY_SET,
  isProgressiveModeKey,
  progressiveModeKeyOf,
};
