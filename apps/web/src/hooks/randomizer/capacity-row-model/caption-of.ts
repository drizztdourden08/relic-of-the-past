/* @layer renderer-lib @kind logic */
import { capacityBonusBaseKeyOf, capacityKeyOf } from '@shared/randomizer/world/capacity';
import type { CapacityFamilyId } from '@shared/randomizer/world/capacity';
import { optionByKey } from '@shared/randomizer/world/options.data';
import type { OptionDescription } from '@shared/randomizer/world/option-description.type';

const modeCaptionOf = (id: CapacityFamilyId): OptionDescription | undefined => {
  const option = optionByKey.get(capacityKeyOf(id, 'mode'));
  return option === undefined ? undefined : option.details ?? option.description;
};

const bonusCaptionOf = (id: CapacityFamilyId): string | undefined =>
  optionByKey.get(capacityBonusBaseKeyOf(id))?.description;

const captionOf = { mode: modeCaptionOf, bonus: bonusCaptionOf };

export { captionOf };
