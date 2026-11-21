/* @layer renderer-components @kind logic */
import type { I18n, MessageKey } from '@drizztdourden08/brock-core/i18n';
import type { OutfitId } from '@rotp/game-data';

const outfitName = (outfit: OutfitId, t: I18n['t']): string =>
  t(`views-player-sprite-studio:outfit.name.${outfit}` as MessageKey);

export { outfitName };
