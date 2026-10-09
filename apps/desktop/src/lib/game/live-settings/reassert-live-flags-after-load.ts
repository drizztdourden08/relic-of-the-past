/* @layer bridge-wasm @kind logic */
import { restoreCheatRules } from '@rotp/game-core';
import { pushDialogLive } from '../live-settings-dialog';
import { DEFAULT_SETTINGS } from '@rotp/game-core';
import { pushTurboSpeed } from '@rotp/game-core';
import { liveSettingsState } from '@rotp/game-core';
import { reassertExtraDungeon } from '@rotp/game-core';
import { reassertFeatureWords } from './reassert-feature-words';
import { reassertGateWord3 } from '@rotp/game-core';
import { reassertHideSpaceBeyondWalls } from '@rotp/game-core';
import { reassertHudHidden } from '@rotp/game-core';
import { reassertPauseHidden } from '@rotp/game-core';
import { reassertVolumes } from '@rotp/game-core';
import { reassertVsync } from '@rotp/game-core';

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
