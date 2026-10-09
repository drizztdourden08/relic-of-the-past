/* @layer bridge-wasm @kind logic */
import { restoreCheatRules, DEFAULT_SETTINGS, pushTurboSpeed, liveSettingsState, reassertExtraDungeon, reassertGateWord3, reassertHideSpaceBeyondWalls, reassertHudHidden, reassertPauseHidden, reassertVolumes, reassertVsync } from '@rotp/game-core';
import { pushDialogLive } from '../live-settings-dialog';
import { reassertFeatureWords } from './reassert-feature-words';

const reassertLiveFlagsAfterLoad = (): void => {
  reassertFeatureWords();
  reassertGateWord3();
  reassertHideSpaceBeyondWalls();
  reassertVsync();
  reassertHudHidden();
  reassertPauseHidden();
  pushDialogLive(liveSettingsState.settings ?? DEFAULT_SETTINGS);
  pushTurboSpeed(liveSettingsState.settings ?? DEFAULT_SETTINGS);
  reassertVolumes();
  reassertExtraDungeon();
  restoreCheatRules();
};

export { reassertLiveFlagsAfterLoad };
