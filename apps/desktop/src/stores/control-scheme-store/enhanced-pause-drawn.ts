/* @layer renderer-stores @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { hostDrawnHud } from '@shared/features/hud-style';
import { useSpriteAvailabilityStore } from '../sprite-availability-store';

const enhancedPauseDrawn = (settings: GameSettings): boolean =>
  hostDrawnHud(settings.hudStyle)
  && settings.hudMode === 'enhanced'
  && settings.hudEnhancedParts.includes('pause')
  && useSpriteAvailabilityStore.getState().available;

export { enhancedPauseDrawn };
