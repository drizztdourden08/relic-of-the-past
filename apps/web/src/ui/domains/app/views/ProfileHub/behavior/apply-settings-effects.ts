/* @layer renderer-components @kind logic */
/** Side effects of a settings change: persist, parent notifications, HUD sync, live push, toast. */
import type React from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { ToastItem } from '../../../../../design-system/primitives/Toast';
import type { ProfileHubProps } from '../ProfileHub.type';
import { pushLiveSettings, LIVE_SETTINGS, getInputManager, applyPlayerSprite, clearPlayerSprite, setLinkSpriteData } from '../../../../../../lib/game';
import { useHudSettingsStore } from '../../../../../../stores/hud-settings-store';
import { DEFAULT_FUNCTION_MAPPINGS } from '@shared/types/controls';
import { writeConfig } from '../../../../../../lib/storage/profile-store';
import { readLinkSprite } from '../../../../../../lib/storage/link-sprites-store';

// Apply a sprite choice to the running core and re-stage it for the next boot. Staging matters even
// when the live swap succeeds: the core re-reads the staged bytes when the game restarts.
const swapPlayerSprite = async (name: string | null): Promise<void> => {
  if (!name) {
    setLinkSpriteData(null);
    clearPlayerSprite();
    return;
  }
  const bytes = await readLinkSprite(name);
  setLinkSpriteData(bytes ?? null);
  if (bytes) applyPlayerSprite(bytes);
};

const syncHudStore = (s: GameSettings): void => {
  useHudSettingsStore.getState().setHudSettings({
    mode: s.hudMode,
    style: s.hudStyle,
    ratio: s.hudRatio,
    customW: s.customHudAspectW,
    customH: s.customHudAspectH,
    enhancedParts: s.hudEnhancedParts,
    heartMode: s.hudHeartMode,
    magicMode: s.hudMagicMode,
    countLayout: s.hudCountLayout,
    pauseStyle: s.hudPauseStyle,
    pauseHighlight: s.hudPauseHighlight,
    showMaxInYellow: s.showMaxItemsInYellow,
  });
};

type ParentCallbacks = Pick<ProfileHubProps,
  'onWindowModeChange' | 'onConstraintSettingsChange' | 'onMasterVolumeChange' | 'onDisplayPerfChange'
  | 'onSaveSlotSettingsChange' | 'onEdgeEffectChange' | 'onShadowCastingChange' | 'onPixelPerfectChange'
>;

interface SettingsEffectDeps extends ParentCallbacks {
  profileId: string;
  isGameRunning: boolean;
  changedKeys: (keyof GameSettings)[];
  restartToastShownRef: React.MutableRefObject<boolean>;
  setToasts: React.Dispatch<React.SetStateAction<ToastItem[]>>;
  setFullscreen: (on: boolean) => void;
}

const applySettingsSideEffects = (patch: Partial<GameSettings>, next: GameSettings, deps: SettingsEffectDeps): void => {
  const {
    profileId, isGameRunning, changedKeys, restartToastShownRef, setToasts, setFullscreen,
    onWindowModeChange, onConstraintSettingsChange, onMasterVolumeChange, onDisplayPerfChange,
    onSaveSlotSettingsChange, onEdgeEffectChange, onShadowCastingChange, onPixelPerfectChange,
  } = deps;

  // Persist asynchronously; surface failures so settings never silently fail to save.
  writeConfig(profileId, { ...next }).catch((e: unknown) => {
    console.error('[settings] failed to persist config', e);
    setToasts((prev) => [
      ...prev.filter((t) => t.id !== 'config-save-failed'),
      { id: 'config-save-failed', message: 'Failed to save settings', variant: 'danger' as const },
    ]);
  });

  // Notify parent of window mode changes
  if ('windowMode' in patch) {
    onWindowModeChange?.(next.windowMode);
  }

  // Apply fullscreen immediately when toggled
  if ('startFullscreen' in patch) {
    setFullscreen(!!next.startFullscreen);
  }

  // Notify parent of constraint-relevant settings changes
  if ('viewportConstraint' in patch || 'aspectRatio' in patch) {
    onConstraintSettingsChange?.(next.viewportConstraint, next.aspectRatio);
  }

  // Notify parent of volume/perf display changes (for titlebar sync)
  if ('masterVolume' in patch) {
    onMasterVolumeChange?.(next.masterVolume);
  }
  if ('displayPerfInTitle' in patch) {
    onDisplayPerfChange?.(next.displayPerfInTitle);
  }

  // Push function mappings to InputManager when changed
  if ('functionMappings' in patch) {
    getInputManager().setFunctionMappings(next.functionMappings ?? DEFAULT_FUNCTION_MAPPINGS);
  }

  // Notify parent of save slot settings changes
  if ('enhancedSaveSlotShortcut' in patch || 'saveHoldDuration' in patch) {
    onSaveSlotSettingsChange?.(next.enhancedSaveSlotShortcut, next.saveHoldDuration);
  }

  // Notify parent of edge effect toggle
  if ('overworldEdgeEffect' in patch) {
    onEdgeEffectChange?.(next.overworldEdgeEffect);
  }

  // Notify parent of shadow casting toggle
  if ('postProcessingShadows' in patch) {
    onShadowCastingChange?.(next.postProcessingShadows);
  }

  // Notify parent of pixel-perfect toggle (drives the canvas fit)
  if ('pixelPerfect' in patch) {
    onPixelPerfectChange?.(next.pixelPerfect);
  }

  // Swap the player sprite sheet in the running core so the choice shows without a restart.
  if ('linkSprite' in patch) {
    void swapPlayerSprite(next.linkSprite);
  }

  // Sync HUD settings to store for live rendering
  if ('hudMode' in patch || 'hudStyle' in patch || 'hudRatio' in patch || 'customHudAspectW' in patch || 'customHudAspectH' in patch || 'hudEnhancedParts' in patch || 'hudHeartMode' in patch || 'hudMagicMode' in patch || 'hudCountLayout' in patch || 'hudPauseStyle' in patch || 'hudPauseHighlight' in patch) {
    syncHudStore(next);
  }

  // If game is running, push live settings and maybe show restart toast
  if (isGameRunning) {
    pushLiveSettings(next);
    const restartKeys = changedKeys.filter((k) => !LIVE_SETTINGS.has(k));
    if (restartKeys.length > 0 && !restartToastShownRef.current) {
      restartToastShownRef.current = true;
      setToasts((prev) => [
        ...prev.filter((t) => t.id !== 'restart-required'),
        {
          id: 'restart-required',
          message: 'Some changes require a game restart to take effect',
          variant: 'danger' as const,
        },
      ]);
    }
  }
};

export { applySettingsSideEffects, syncHudStore };
export type { SettingsEffectDeps };
