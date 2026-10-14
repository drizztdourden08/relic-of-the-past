/* @layer renderer-components @kind hook */
import { hostDrawnHud } from '@rotp/features';
import { isMainHudVisibleForMode } from '../../../hud/hud-visibility';
import { useGameUIStore } from '../../../stores/game-ui-store';
import { useHudSettingsStore } from '../../../stores/hud-settings-store';
import { useSpriteAvailabilityStore } from '../../../stores/sprite-availability-store';
import type { HudRenderable } from '../GameOverlay.type';

const useHudRenderable = (): HudRenderable => {
  const { mode: hudMode, style: hudStyle, enhancedParts } = useHudSettingsStore();
  const gameMode = useGameUIStore((s) => s.mode);
  const spritesAvailable = useSpriteAvailabilityStore((s) => s.available);
  const enhancedHudMode = hudMode === 'enhanced';

  const spriteHudRenderable = hudStyle === 'vanilla' && spritesAvailable;
  const enhancedRenderable = hostDrawnHud(hudStyle) && spritesAvailable;
  const showMainSlot = enhancedHudMode && enhancedParts.includes('main') && isMainHudVisibleForMode(gameMode);
  const showPauseMenu = enhancedHudMode && enhancedParts.includes('pause') && (spriteHudRenderable || enhancedRenderable);

  return { gameMode, enhancedHudMode, spriteHudRenderable, enhancedRenderable, showMainSlot, showPauseMenu };
};

export { useHudRenderable };
