/* @layer shared-game @kind logic */
import { normalizeEnabled, openedSlotIndicesOf } from '../../shops/shop-scope';
import { ARROW_SLOT_INDEXES } from './retro-shops.constants';
import { shopsShuffled } from './shops-shuffled';
import type { ShopScope } from '../../shops/shop-scope.type';
import type { RetroBowSetting } from '../retro.type';

const withRetroArrowSlots = (scope: ShopScope, setting: RetroBowSetting): ShopScope => {
  if (!setting.enabled || !shopsShuffled(scope)) return scope;
  const opened = normalizeEnabled([...openedSlotIndicesOf(scope), ...ARROW_SLOT_INDEXES]);
  return { ...scope, mode: 'custom', enabled: opened, slotCount: opened.length };
};

export { withRetroArrowSlots };
