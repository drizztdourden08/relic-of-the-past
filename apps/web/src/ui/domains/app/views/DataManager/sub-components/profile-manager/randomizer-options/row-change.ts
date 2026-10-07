/* @layer renderer-components @kind logic */
/**
 * How a row of the options panel reads its value and writes a change back into the form's
 * choices. Plain unlocked rows go through the catalog-key to form-field map, so a new
 * unlocked toggle is one map row plus its form field; a pond's mode row rewrites that pond.
 */
import { CAPACITY_ENABLED_KEY } from '@shared/randomizer/world/capacity';
import { pondSettingForMode } from '@shared/randomizer/world/pond/pond-mode-switch';
import { pondIdOfModeKey } from '@shared/randomizer/world/pond/pond-option-keys';
import { CHOICE_FIELDS, NUMERIC_FIELDS, PLAIN_FIELD_BY_KEY } from '@app/hooks/randomizer/randomizer-choices';
import { withCapacityPondRule } from '@app/hooks/randomizer/capacity-pond-choices';
import type { OptionDef, OptionValue } from '@shared/randomizer/world/options.type';
import type { PondMode } from '@shared/randomizer/world/pond/pond-profile.type';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

/**
 * The value a row shows. The master switch and the pond mode are read off the
 * SNAPSHOT instead of the raw choices, because the snapshot is the pair after
 * the capacity/pond rule has settled it, so the row has to say what the seed
 * will be built from, not what was asked for before the rule answered.
 */
const valueFor = (
  option: OptionDef, chosen: RandomizerOptionChoices, values: Readonly<Record<string, OptionValue>>,
): OptionValue => {
  if (option.key === CAPACITY_ENABLED_KEY || pondIdOfModeKey(option.key) !== undefined) return values[option.key];
  const field = PLAIN_FIELD_BY_KEY[option.key];
  return field === undefined ? option.baseline : chosen[field];
};

/** The choices after one row moved to `next`; the same choices for a row no field backs. */
const choicesAfterRow = (value: RandomizerOptionChoices, key: string, next: OptionValue): RandomizerOptionChoices => {
  const pondId = pondIdOfModeKey(key);
  if (pondId !== undefined) {
    const pond = pondSettingForMode(String(next) as PondMode, value.ponds[pondId]);
    const ponds = { ...value.ponds, [pondId]: pond };
    // Only the capacity pond is bound to the capacity families, so only its
    // move asks the rule to settle the pair; the other two stand alone.
    return pondId === 'capacity' ? withCapacityPondRule({ ...value, ponds }, 'pond') : { ...value, ponds };
  }
  const field = PLAIN_FIELD_BY_KEY[key];
  if (field === undefined) return value;
  // A select row writes the catalog's own key, a slider a number, a toggle a
  // boolean, because coercing a chosen key to Boolean would store `true` for every
  // value the row offers.
  if (CHOICE_FIELDS.has(field)) return { ...value, [field]: String(next) } as RandomizerOptionChoices;
  return { ...value, [field]: NUMERIC_FIELDS.has(field) ? Number(next) : Boolean(next) };
};

export { choicesAfterRow, valueFor };
