/* @layer renderer-lib @kind logic */
import { defaultFamilyBonus } from '@rotp/randomizer';
import type { CapacityFamilyId, FamilyBonus, FamilySetting } from '@rotp/randomizer';

const bonusOf = (id: CapacityFamilyId, setting: FamilySetting, requested: FamilyBonus | undefined): FamilyBonus | undefined =>
  setting.mode === 'vanilla' ? undefined : requested ?? defaultFamilyBonus(id);

export { bonusOf };
