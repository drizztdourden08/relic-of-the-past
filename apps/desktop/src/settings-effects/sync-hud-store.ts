/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';

const syncHudStore = (s: GameSettings): void => {
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
    countdownStyle: s.hudCountdownStyle,
    showMaxInYellow: s.showMaxItemsInYellow,
  });
};

export { syncHudStore };
