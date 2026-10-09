/* @layer shared-game @kind constants */
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.data';
import { DEFAULT_HEART_CAP, MAX_HEART_CAP, STARTING_HEARTS } from './difficulty.data';
import { HEART_CAP_KEY, difficultyCopiesKeyOf } from './difficulty-option-keys';
import { difficultyCopiesSeed } from './difficulty-copies-seed';
import type { OptionSeed } from '../options.type';
import type { OptionDescription } from '../option-description.type';

const HEART_CAP_SEED: OptionSeed = {
  key: HEART_CAP_KEY,
  displayName: 'Most hearts',
  group: 'items',
  kind: 'range',
  implementation: 'active',
  range: { min: STARTING_HEARTS, max: MAX_HEART_CAP },
  sourceDefault: DEFAULT_HEART_CAP,
  baseline: DEFAULT_HEART_CAP,
  locked: false,
  synthetic: true,
};

const DIFFICULTY_OPTION_SEEDS: readonly OptionSeed[] = [
  ...PROGRESSIVE_FAMILIES.map((_family, index) => difficultyCopiesSeed(index)),
  HEART_CAP_SEED,
];

const COPIES_DESCRIPTION = 'Extra copies are more of the same item; one past the top rung gives rupees instead.';

const DIFFICULTY_OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = {
  ...Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) => [difficultyCopiesKeyOf(family.id), COPIES_DESCRIPTION])),
  [HEART_CAP_KEY]: 'Hearts a lower ceiling takes out of the seed come back as rupee pickups.',
};

export { DIFFICULTY_OPTION_DESCRIPTIONS, DIFFICULTY_OPTION_SEEDS };
