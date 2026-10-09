/* @layer bridge-wasm @kind logic */
import { restoreCheatRules } from '../cheat-rules-memory';
import { pushDialogLive } from '../live-settings-dialog';
import { DEFAULT_SETTINGS } from '../settings';
import { pushTurboSpeed } from '../turbo';
import { liveSettingsState } from './live-settings-state';
import { reassertExtraDungeon } from './reassert-extra-dungeon';
import { reassertFeatureWords } from './reassert-feature-words';
import { reassertGateWord3 } from './reassert-gate-word-3';
import { reassertHideSpaceBeyondWalls } from './reassert-hide-space-beyond-walls';
import { reassertHudHidden } from './reassert-hud-hidden';
import { reassertPauseHidden } from './reassert-pause-hidden';
import { reassertVolumes } from './reassert-volumes';
import { reassertVsync } from './reassert-vsync';

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
