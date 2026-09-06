/* @layer shared-game @kind logic */
/**
 * The catalog keys the difficulty rows occupy. The copy multiples are derived
 * from the family table, so a family added to the data brings its row with it;
 * each key names the FAMILY and never a rung, so it survives any change to the
 * ladder underneath it. The heart ceiling is one row of its own, because it is
 * one number about one thing.
 */
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.data';
import type { ProgressiveFamilyId } from '../progressive/progressive.type';

const difficultyCopiesKeyOf = (family: ProgressiveFamilyId): string => `difficulty_copies_${family}`;

const HEART_CAP_KEY = 'difficulty_heart_cap';

const DIFFICULTY_COPIES_KEYS: readonly string[] =
  PROGRESSIVE_FAMILIES.map((family) => difficultyCopiesKeyOf(family.id));

/** Every key the difficulty block owns, in the order it renders them. */
const DIFFICULTY_OPTION_KEYS: readonly string[] = [...DIFFICULTY_COPIES_KEYS, HEART_CAP_KEY];

const DIFFICULTY_OPTION_KEY_SET: ReadonlySet<string> = new Set(DIFFICULTY_OPTION_KEYS);

const isDifficultyOptionKey = (key: string): boolean => DIFFICULTY_OPTION_KEY_SET.has(key);

export {
  DIFFICULTY_COPIES_KEYS,
  DIFFICULTY_OPTION_KEYS,
  DIFFICULTY_OPTION_KEY_SET,
  HEART_CAP_KEY,
  difficultyCopiesKeyOf,
  isDifficultyOptionKey,
};
