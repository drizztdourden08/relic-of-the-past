/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { hostDrawnHud } from '@shared/features/hud-style';
import { DEFAULT_SETTINGS } from './default-settings';
import { LEGACY_ENHANCED, REMOVED_SETTING_KEYS } from './settings.constants';

const forceEnhancedHudUnderTall = (merged: GameSettings): void => {
  if (!merged.tallRendering) return;
  merged.hudMode = 'enhanced';
  if (!merged.hudEnhancedParts.includes('main'))
    merged.hudEnhancedParts = [...merged.hudEnhancedParts, 'main'];
};

const migrateLegacyEnhancedStyle = (merged: GameSettings, storedProfile: Record<string, unknown>): void => {
  if (storedProfile.hudStyle === LEGACY_ENHANCED) {
    merged.hudStyle = storedProfile.controlScheme === 'modern' ? 'modern' : 'enhanced';
  }
};

const forceOverlayForHostDrawnStyle = (merged: GameSettings): void => {
  if (!hostDrawnHud(merged.hudStyle)) return;
  merged.hudMode = 'enhanced';
  merged.hudEnhancedParts = ['main', 'pause'];
};

const mergeSettings = (partial: Partial<GameSettings>): GameSettings => {
  const merged = { ...DEFAULT_SETTINGS, ...partial };
  const storedProfile = partial as Record<string, unknown>;

  forceEnhancedHudUnderTall(merged);
  migrateLegacyEnhancedStyle(merged, storedProfile);
  forceOverlayForHostDrawnStyle(merged);

  for (const key of REMOVED_SETTING_KEYS)
    delete (merged as Record<string, unknown>)[key];

  merged.enableAudio = true;

  return merged;
};

export { mergeSettings };
