/* @layer renderer-components @kind logic */
/** Side effects of a settings change: persist, parent notifications, HUD sync, live push, toast. */
import type React from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { ToastItem } from '../../../../../design-system/primitives/Toast';
import type { ProfileHubProps } from '../ProfileHub.type';
import { pushLiveSettings, LIVE_SETTINGS, getInputManager, applyPlayerSprite, clearPlayerSprite, setLinkSpriteData } from '../../../../../../lib/game';
import { useHudSettingsStore } from '../../../../../../stores/hud-settings-store';
import { syncDialogStore, touchesDialogStore } from './sync-dialog-store';
import { syncTitleStore, touchesTitleStore } from './sync-title-store';
import { DEFAULT_FUNCTION_MAPPINGS } from '@shared/types/controls';
import { writeConfig } from '../../../../../../lib/storage/profile-store';
import { readSpriteAsZspr } from '../../../../../../lib/game/player-sheet/load-sheet';
import { enhancedAspectAllowed } from '../../../../../../lib/game/settings';
import { requestEnhancedFallback } from '@app/lib/game/enhanced-fallback';
import { hostDrawnHud } from '@shared/features/hud-style';
import { syncControlSettings } from '@app/stores/control-scheme-store';

// Apply a sprite choice to the running core and re-stage it for the next boot. Staging matters even
// when the live swap succeeds: the core re-reads the staged bytes when the game restarts.
const swapPlayerSprite = async (name: string | null): Promise<void> => {
  if (!name) {
    setLinkSpriteData(null);
    clearPlayerSprite();
    return;
  }
  const bytes = await readSpriteAsZspr(name);
  setLinkSpriteData(bytes ?? null);
  if (bytes) applyPlayerSprite(bytes);
};

const syncHudStore = (s: GameSettings): void => {
  // Vanilla Safe brings the native HUD back in the core (its HudOverride bit is masked), so the host
  // overlay has to stand down in the same breath. Locking the setting only greys the control out; the
  // stored value stays 'enhanced', and the overlay would carry on drawing over the native HUD the core
  // just restored, which is the doubled HUD. 'original' IS the stock HUD here. The saved preference is
  // untouched, so it returns intact when Vanilla Safe goes back off.
  const vanilla = s.vanillaSafe === true;
  useHudSettingsStore.getState().setHudSettings({
    mode: vanilla ? 'original' : s.hudMode,
    style: s.hudStyle,
    ratio: s.hudRatio,
    customW: s.customHudAspectW,
    customH: s.customHudAspectH,
    enhancedParts: vanilla ? [] : s.hudEnhancedParts,
    heartMode: s.hudHeartMode,
    magicMode: s.hudMagicMode,
    countLayout: s.hudCountLayout,
    showMaxInYellow: s.showMaxItemsInYellow,
  });
};

// Keys the HUD render store mirrors; a change to any of them re-syncs it.
const HUD_STORE_KEYS: (keyof GameSettings)[] = [
  'hudMode', 'hudStyle', 'hudRatio', 'customHudAspectW', 'customHudAspectH', 'hudEnhancedParts',
  'hudHeartMode', 'hudMagicMode', 'hudCountLayout', 'vanillaSafe',
];

// Keys the control-scheme store and the per-frame input router are derived from. Every one of
// them is read by `syncControlSettings`, which is deliberately given the whole settings object
// instead of a patch: the scheme itself and the takeover it arms are both derived from the HUD
// style, and Vanilla Safe strips them. None of that is obviously input's business.
const CONTROL_STORE_KEYS: (keyof GameSettings)[] = [
  'modernScheme', 'mapOnSelect', 'vanillaSafe',
  'hudStyle', 'hudMode', 'hudEnhancedParts',
];

// Keys that can change the display ratio a host-drawn style is measured against.
const ASPECT_KEYS: (keyof GameSettings)[] = ['hudStyle', 'aspectRatio', 'customAspectW', 'customAspectH', 'renderIntoNotch'];

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
  if (HUD_STORE_KEYS.some((k) => k in patch)) {
    syncHudStore(next);
  }
  if (touchesDialogStore(patch)) {
    syncDialogStore(next);
  }
  if (touchesTitleStore(patch)) {
    syncTitleStore(next);
  }

  // Control scheme + slot assignments go to the store AND the scheme runtime, which is what the
  // per-frame router reads to turn a pressed button into an item id and the Y bit. Pushing here
  // instead of leaving it to the store's own game-UI subscription is what makes an assignment
  // take effect at the moment it is made: that subscription only ticks while the core is running.
  if (CONTROL_STORE_KEYS.some((k) => k in patch)) syncControlSettings(next);

  // A host-drawn style needs a 16:9-or-wider display to have room for the HUD and the menu.
  // If the ratio is narrowed while it is active, drop back to the original style and say why.
  // Silently rendering a clipped menu would be worse than losing the style.
  // The correction is queued instead of applied inline: this runs inside the setSettings updater,
  // and feeding a second change straight back into it would re-enter that updater.
  // Merely shrinking the window can do it too, with no settings change at all; that route
  // raises the same request from GameOverlay, so the drop and its wording live in one place.
  if (ASPECT_KEYS.some((k) => k in patch) && !enhancedAspectAllowed(next) && hostDrawnHud(next.hudStyle)) {
    queueMicrotask(requestEnhancedFallback);
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
