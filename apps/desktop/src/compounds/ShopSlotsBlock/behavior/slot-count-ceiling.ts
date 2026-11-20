/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const slotCountCeiling = (ticked: number, t: I18n['t']): string => t('compounds:shop-slots-block.slot-count-ceiling', { count: ticked });

export { slotCountCeiling };
