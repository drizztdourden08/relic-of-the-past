/* @layer renderer-appshell @kind logic */
import { DEFAULT_FUNCTION_MAPPINGS } from '@rotp/features';
import { getInputManager, pushLiveSettings } from '@app/game';
import { syncControlSettings } from '@app/stores/control-scheme-store';
import { syncHudStore } from '@app/settings-effects/sync-hud-store';
import { syncDialogStore } from '@app/settings-effects/sync-dialog-store';
import { syncTitleStore } from '@app/settings-effects/sync-title-store';
import type { SettingsBridgeDeps } from '@app/settings-effects/settings-effects.type';
import type { AppSettings } from '@app/settings.type';

const pushHydratedSettings = (merged: AppSettings, callbacks: SettingsBridgeDeps['callbacks']): void => {
  syncHudStore(merged);
  syncDialogStore(merged);
  syncTitleStore(merged);
  syncControlSettings(merged);
  callbacks.onWindowModeChange?.(merged.windowMode);
  callbacks.onConstraintSettingsChange?.(merged.viewportConstraint, merged.aspectRatio);
  callbacks.onDisplayPerfChange?.(merged.displayPerfInTitle);
  callbacks.onEdgeEffectChange?.(merged.overworldEdgeEffect);
  callbacks.onShadowCastingChange?.(merged.postProcessingShadows);
  callbacks.onPixelPerfectChange?.(merged.pixelPerfect);
  getInputManager().setFunctionMappings(merged.functionMappings ?? DEFAULT_FUNCTION_MAPPINGS);
  pushLiveSettings(merged);
};

export { pushHydratedSettings };
