/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ShopScopeSummary } from '../ShopSlotsBlock.type';

const shopTotalTextOf = (summary: ShopScopeSummary, t: I18n['t']): string => {
  const { active, opened, depth, locations } = summary;
  if (!active) return t('compounds:shop-slots-block.vanilla-total');
  return t('compounds:shop-slots-block.total', { slots: opened, items: depth, locations });
};

export { shopTotalTextOf };
