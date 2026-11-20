/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ShopCountControl, ShopScopeSummary } from '../ShopSlotsBlock.type';
import { slotCountCeiling } from './slot-count-ceiling';

const shopCountControlOf = (summary: ShopScopeSummary, t: I18n['t']): ShopCountControl => {
  const { active, counts, opened, ticked } = summary;
  if (counts) {
    return { kind: 'slider', value: opened, max: Math.max(ticked, 1), description: slotCountCeiling(ticked, t) };
  }
  return {
    kind: 'readout',
    value: t('compounds:shop-slots-block.slot-count-readout', { opened, ticked }),
    description: active ? t('compounds:shop-slots-block.slot-count-follows-ticks') : t('compounds:shop-slots-block.slot-count-inert'),
  };
};

export { shopCountControlOf };
