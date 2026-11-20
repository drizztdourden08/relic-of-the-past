/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { RetroShelfNote } from '../ShopSlotsBlock.type';
import { listedNames } from './listed-names';

const retroShuffledNote = (note: RetroShelfNote, t: I18n['t']): string => {
  const { quiverShelf, otherShelves } = note;
  if (otherShelves.length === 0) return t('compounds:shop-slots-block.retro-shuffled', { quiverShelf });
  return t('compounds:shop-slots-block.retro-shuffled-with', { quiverShelf, others: listedNames(otherShelves, t) });
};

export { retroShuffledNote };
