/* @layer renderer-lib @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { CapacityFamilyId, FamilySetting } from '@rotp/randomizer';
import type { CapacityRowModel } from '@app/compounds/CapacityFamilyRow';

const footnoteOf = (id: CapacityFamilyId, setting: FamilySetting, t: I18n['t']): CapacityRowModel['footnote'] =>
  id === 'wallet' && setting.mode === 'custom' ? t('randomizer:capacity-row.wallet-footnote') : undefined;

export { footnoteOf };
