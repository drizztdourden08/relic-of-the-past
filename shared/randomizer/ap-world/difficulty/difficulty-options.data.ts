/* @layer shared-game @kind data */
/**
 * The six difficulty rows of the option catalog: synthetic, unlocked, group
 * 'items', so they sit with the rest of what is in the seed and the block
 * renders them together beside the tier cards they qualify.
 *
 * Together they replace the reference's single four-step pool choice, which is
 * not in the catalog at all: its generous step is these five multiples set to
 * double, and its two mean steps are the tier ticks and this ceiling. Asking it
 * as one row would mean a player cannot double the blades without also
 * doubling everything else, which is the whole reason it was taken apart.
 *
 * Every baseline is the reference pool, one copy per rung and the ceiling the
 * game itself enforces, so a fresh profile rolls the seed it always rolled and
 * a snapshot frozen before these rows existed reads the same way.
 */
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.data';
import { progressiveFamilyName } from '../progressive/progressive-display-names';
import {
  COPY_MULTIPLIERS, DEFAULT_COPY_MULTIPLIER, DEFAULT_HEART_CAP, MAX_HEART_CAP, STARTING_HEARTS,
} from './difficulty.data';
import { HEART_CAP_KEY, difficultyCopiesKeyOf } from './difficulty-option-keys';
import type { ApOptionDef } from '../options.type';
import type { OptionDescription } from '../option-description.type';

type Seed = Omit<ApOptionDef, 'description'>;

const FIRST_STEP = COPY_MULTIPLIERS[0];
const LAST_STEP = COPY_MULTIPLIERS[COPY_MULTIPLIERS.length - 1];

const copiesSeed = (index: number): Seed => ({
  key: difficultyCopiesKeyOf(PROGRESSIVE_FAMILIES[index].id),
  displayName: `${progressiveFamilyName(PROGRESSIVE_FAMILIES[index])}: copies`,
  group: 'items',
  kind: 'range',
  implementation: 'active',
  range: { min: FIRST_STEP, max: LAST_STEP },
  apDefault: DEFAULT_COPY_MULTIPLIER,
  baseline: DEFAULT_COPY_MULTIPLIER,
  locked: false,
  synthetic: true,
});

const HEART_CAP_SEED: Seed = {
  key: HEART_CAP_KEY,
  displayName: 'Most hearts',
  group: 'items',
  kind: 'range',
  implementation: 'active',
  range: { min: STARTING_HEARTS, max: MAX_HEART_CAP },
  apDefault: DEFAULT_HEART_CAP,
  baseline: DEFAULT_HEART_CAP,
  locked: false,
  synthetic: true,
};

const DIFFICULTY_OPTION_SEEDS: readonly Seed[] = [
  ...PROGRESSIVE_FAMILIES.map((_family, index) => copiesSeed(index)),
  HEART_CAP_SEED,
];

const COPIES = 'Extra copies are more of the same item; one past the top rung gives rupees instead.';

const DIFFICULTY_OPTION_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = {
  ...Object.fromEntries(PROGRESSIVE_FAMILIES.map((family) => [difficultyCopiesKeyOf(family.id), COPIES])),
  [HEART_CAP_KEY]: 'Hearts a lower ceiling takes out of the seed come back as rupee pickups.',
};

export { DIFFICULTY_OPTION_DESCRIPTIONS, DIFFICULTY_OPTION_SEEDS };
