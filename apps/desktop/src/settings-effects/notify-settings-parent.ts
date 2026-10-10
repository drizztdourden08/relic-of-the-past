/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { DEFAULT_FUNCTION_MAPPINGS } from '@rotp/features';
import { getInputManager } from '@app/game';
import type { SettingsEffectDeps } from './settings-effects.type';

const notifySettingsParent = (patch: Partial<GameSettings>, next: GameSettings, deps: SettingsEffectDeps): void => {
  const {
    setFullscreen,
    onWindowModeChange, onConstraintSettingsChange, onMasterVolumeChange, onDisplayPerfChange,
    onSaveSlotSettingsChange, onEdgeEffectChange, onShadowCastingChange, onPixelPerfectChange,
  } = deps;

  if ('windowMode' in patch) onWindowModeChange?.(next.windowMode);
  if ('startFullscreen' in patch) setFullscreen(Boolean(next.startFullscreen));
  if ('viewportConstraint' in patch || 'aspectRatio' in patch) {
    onConstraintSettingsChange?.(next.viewportConstraint, next.aspectRatio);
  }
  if ('masterVolume' in patch) onMasterVolumeChange?.(next.masterVolume);
  if ('displayPerfInTitle' in patch) onDisplayPerfChange?.(next.displayPerfInTitle);
  if ('functionMappings' in patch) {
    getInputManager().setFunctionMappings(next.functionMappings ?? DEFAULT_FUNCTION_MAPPINGS);
  }
  if ('enhancedSaveSlotShortcut' in patch || 'saveHoldDuration' in patch) {
    onSaveSlotSettingsChange?.(next.enhancedSaveSlotShortcut, next.saveHoldDuration);
  }
  if ('overworldEdgeEffect' in patch) onEdgeEffectChange?.(next.overworldEdgeEffect);
  if ('postProcessingShadows' in patch) onShadowCastingChange?.(next.postProcessingShadows);
  if ('pixelPerfect' in patch) onPixelPerfectChange?.(next.pixelPerfect);
};

export { notifySettingsParent };
