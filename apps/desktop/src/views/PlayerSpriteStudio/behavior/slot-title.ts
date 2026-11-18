/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { OutfitId } from '@rotp/game-data';
import { OUTFIT_LABELS } from '@rotp/design/packs';
import type { Slot } from '../PlayerSpriteStudio.type';

const slotTitle = (slot: Slot, outfit: OutfitId, t: I18n['t']): string => {
  if (slot === null) return '';
  if (typeof slot === 'number') return t('views-player-sprite-studio:slot.outfit', { outfit: OUTFIT_LABELS[outfit], index: slot + 1 });
  return slot === 'g0' ? t('views-player-sprite-studio:slot.glovesPower') : t('views-player-sprite-studio:slot.glovesTitan');
};

export { slotTitle };
