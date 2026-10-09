/* @layer shared-game @kind constants */
import { PROGRESSIVE_FAMILIES } from '../../progressive/progressive-families.data';
import { difficultyCopiesKeyOf } from './difficulty-copies-key-of';
import { HEART_CAP_KEY } from './difficulty-option-keys.constants';

const DIFFICULTY_COPIES_KEYS: readonly string[] =
  PROGRESSIVE_FAMILIES.map((family) => difficultyCopiesKeyOf(family.id));

const DIFFICULTY_OPTION_KEYS: readonly string[] = [...DIFFICULTY_COPIES_KEYS, HEART_CAP_KEY];

const DIFFICULTY_OPTION_KEY_SET: ReadonlySet<string> = new Set(DIFFICULTY_OPTION_KEYS);

export { DIFFICULTY_COPIES_KEYS, DIFFICULTY_OPTION_KEYS, DIFFICULTY_OPTION_KEY_SET };
