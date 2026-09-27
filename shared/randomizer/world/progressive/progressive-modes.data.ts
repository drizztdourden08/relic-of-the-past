/* @layer shared-game @kind data */
/**
 * How each family's copies reach the player, and the default every stored seed
 * reads as.
 *
 * Every family defaults to `progressive`, which is the reference project's own
 * reading and the one every placement rolled before these rows existed was
 * generated under. An absent row therefore changes nothing: the same pool, the
 * same ladder, the same seed.
 */
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import type {
  ProgressiveFamilyId, ProgressiveFamilyMode, ProgressiveModeSetting,
} from './progressive.type';

/** The two readings a family may be generated under, in the order the control offers them. */
const PROGRESSIVE_MODES: readonly ProgressiveFamilyMode[] = ['progressive', 'random'];

/** Short wording for each mode, shared by the card control and the catalog row. */
const PROGRESSIVE_MODE_LABELS: Readonly<Record<ProgressiveFamilyMode, string>> = {
  progressive: 'In order',
  random: 'Any order',
};

/** The reference reading for every family: what an absent row means. */
const DEFAULT_PROGRESSIVE_MODES: ProgressiveModeSetting = Object.fromEntries(
  PROGRESSIVE_FAMILIES.map((family) => [family.id, 'progressive' as ProgressiveFamilyMode]),
) as unknown as ProgressiveModeSetting;

/** A fresh mutable-safe copy for a creation form. */
const defaultProgressiveModes = (): ProgressiveModeSetting => ({ ...DEFAULT_PROGRESSIVE_MODES });

/** True while every family is still on the reference reading. */
const isReferenceProgressiveModes = (modes: ProgressiveModeSetting): boolean =>
  PROGRESSIVE_FAMILIES.every((family) => modes[family.id] !== 'random');

const isRandomOrder = (modes: ProgressiveModeSetting, family: ProgressiveFamilyId): boolean =>
  modes[family] === 'random';

export {
  DEFAULT_PROGRESSIVE_MODES,
  PROGRESSIVE_MODES,
  PROGRESSIVE_MODE_LABELS,
  defaultProgressiveModes,
  isRandomOrder,
  isReferenceProgressiveModes,
};
