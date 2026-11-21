/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { RetroShelfNote } from '../ShopSlotsBlock.type';
import { listedNames } from './listed-names';

const retroVanillaNote = (note: RetroShelfNote, t: I18n['t']): string => {
  const { quiverShelf, quiverPrice, refill, refillPrice, otherShelves } = note;
  const values = { quiverShelf, quiverPrice, refill, refillPrice };
  if (otherShelves.length === 0) return t('compounds:shop-slots-block.retro-vanilla', values);
  return t('compounds:shop-slots-block.retro-vanilla-with', { ...values, others: listedNames(otherShelves, t) });
};

export { retroVanillaNote };
