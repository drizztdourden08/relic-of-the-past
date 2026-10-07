/* @layer shared-game @kind data */
/**
 * The five per-family mode rows of the option catalog: synthetic, unlocked,
 * group 'items', so they sit with the tier ticks they qualify. The reference
 * project asks this once for the whole seed (Options.py Progressive: off /
 * grouped_random / on), which forces every family to the same answer; this app
 * asks it per family, because "the blades in order, the shields in any order"
 * is a shape a player thinks in and the reference cannot say.
 *
 * Every baseline is the in-order reading (the reference's own `on`), so a
 * fresh profile rolls the seed it always rolled and a snapshot frozen before
 * these rows existed reads the same way.
 */
import { PROGRESSIVE_FAMILIES } from './progressive-families.data';
import { progressiveFamilyName } from './progressive-display-names';
import { progressiveModeKeyOf } from './progressive-mode-keys';
import { PROGRESSIVE_MODES, PROGRESSIVE_MODE_LABELS } from './progressive-modes.data';
import type { ApOptionChoice, ApOptionDef } from '../options.type';
import type { OptionDescription } from '../option-description.type';
import type { ProgressiveFamilyDef } from './progressive.type';

type Seed = Omit<ApOptionDef, 'description'>;

/** apValue mirrors the reference's own two live steps: on (2) and off (0). */
const MODE_AP_VALUE: Readonly<Record<string, number>> = { progressive: 2, random: 0 };

const MODE_CHOICES: readonly ApOptionChoice[] = PROGRESSIVE_MODES.map((mode) => ({
  value: mode,
  apValue: MODE_AP_VALUE[mode],
  label: PROGRESSIVE_MODE_LABELS[mode],
}));

const modeSeed = (family: ProgressiveFamilyDef): Seed => ({
  key: progressiveModeKeyOf(family.id),
  displayName: `${progressiveFamilyName(family)}: how the tiers arrive`,
  group: 'items',
  kind: 'choice',
  implementation: 'active',
  choices: MODE_CHOICES,
  apDefault: 'progressive',
  baseline: 'progressive',
  locked: false,
  synthetic: true,
});

const PROGRESSIVE_MODE_OPTION_SEEDS: readonly Seed[] = PROGRESSIVE_FAMILIES.map(modeSeed);

const MODE_DESCRIPTION: OptionDescription =
  'Any order makes each copy a specific rung, so the top of the ladder can turn up first.';

const PROGRESSIVE_MODE_DESCRIPTIONS: Readonly<Record<string, OptionDescription>> = Object.fromEntries(
  PROGRESSIVE_FAMILIES.map((family) => [progressiveModeKeyOf(family.id), MODE_DESCRIPTION]),
);

export { MODE_CHOICES, PROGRESSIVE_MODE_DESCRIPTIONS, PROGRESSIVE_MODE_OPTION_SEEDS };
