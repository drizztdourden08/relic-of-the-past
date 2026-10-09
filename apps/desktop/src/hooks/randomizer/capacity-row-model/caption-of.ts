/* @layer renderer-lib @kind logic */
import { capacityBonusBaseKeyOf, capacityKeyOf, optionByKey } from '@rotp/randomizer';
import type { CapacityFamilyId, OptionDescription } from '@rotp/randomizer';

const modeCaptionOf = (id: CapacityFamilyId): OptionDescription | undefined => {
  const option = optionByKey.get(capacityKeyOf(id, 'mode'));
  return option === undefined ? undefined : option.details ?? option.description;
};

const bonusCaptionOf = (id: CapacityFamilyId): string | undefined =>
  optionByKey.get(capacityBonusBaseKeyOf(id))?.description;

const captionOf = { mode: modeCaptionOf, bonus: bonusCaptionOf };

export { captionOf };
