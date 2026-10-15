/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { hostDrawnHud } from '@rotp/features';
import { DEFAULT_SETTINGS } from './default-settings';

const forceEnhancedHudUnderTall = (merged: GameSettings): void => {
  if (!merged.tallRendering) return;
  merged.hudMode = 'enhanced';
  if (!merged.hudEnhancedParts.includes('main'))
    merged.hudEnhancedParts = [...merged.hudEnhancedParts, 'main'];
};

const forceOverlayForHostDrawnStyle = (merged: GameSettings): void => {
  if (!hostDrawnHud(merged.hudStyle)) return;
  merged.hudMode = 'enhanced';
  merged.hudEnhancedParts = ['main', 'pause'];
};

const mergeSettings = (partial: Partial<GameSettings>): GameSettings => {
  const merged = { ...DEFAULT_SETTINGS, ...partial };

  forceEnhancedHudUnderTall(merged);
  forceOverlayForHostDrawnStyle(merged);

  merged.enableAudio = true;

  return merged;
};

export { mergeSettings };
