/* @layer renderer-stores @kind logic */
import type { GameSettings } from '@rotp/features';
import { hostDrawnHud } from '@rotp/features';
import { useSpriteAvailabilityStore } from '../sprite-availability-store';

const enhancedPauseDrawn = (settings: GameSettings): boolean =>
  hostDrawnHud(settings.hudStyle)
  && settings.hudMode === 'enhanced'
  && settings.hudEnhancedParts.includes('pause')
  && useSpriteAvailabilityStore.getState().available;

export { enhancedPauseDrawn };
