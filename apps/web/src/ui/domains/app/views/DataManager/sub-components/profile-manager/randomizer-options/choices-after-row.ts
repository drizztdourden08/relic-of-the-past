/* @layer renderer-components @kind logic */
import { pondSettingForMode } from '@shared/randomizer/world/pond/pond-mode-switch';
import { pondIdOfModeKey } from '@shared/randomizer/world/pond/pond-option-keys';
import { CHOICE_FIELDS, NUMERIC_FIELDS, PLAIN_FIELD_BY_KEY } from '@app/hooks/randomizer/randomizer-choices';
import { withCapacityPondRule } from '@app/hooks/randomizer/capacity-pond-choices';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type { PondMode } from '@shared/randomizer/world/pond/pond-profile.type';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

const choicesAfterRow = (value: RandomizerOptionChoices, key: string, next: OptionValue): RandomizerOptionChoices => {
  const pondId = pondIdOfModeKey(key);
  if (pondId !== undefined) {
    const pond = pondSettingForMode(String(next) as PondMode, value.ponds[pondId]);
    const ponds = { ...value.ponds, [pondId]: pond };
    return pondId === 'capacity' ? withCapacityPondRule({ ...value, ponds }, 'pond') : { ...value, ponds };
  }
  const field = PLAIN_FIELD_BY_KEY[key];
  if (field === undefined) return value;
  if (CHOICE_FIELDS.has(field)) return { ...value, [field]: String(next) } as RandomizerOptionChoices;
  return { ...value, [field]: NUMERIC_FIELDS.has(field) ? Number(next) : Boolean(next) };
};

export { choicesAfterRow };
