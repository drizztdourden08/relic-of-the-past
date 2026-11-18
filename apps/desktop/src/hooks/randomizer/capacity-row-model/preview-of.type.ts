/* @layer renderer-lib @kind types */
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';
import type { CapacityFamily, FamilyPlan, FamilySetting } from '@rotp/randomizer';

interface PreviewInput {
  capacityFamily: CapacityFamily;
  setting: FamilySetting;
  plan: FamilyPlan;
  t: I18n['t'];
  text: (text: Text) => string;
}

export type { PreviewInput };
