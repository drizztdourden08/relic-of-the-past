/* @layer renderer-app @kind logic */
import { primeLiveSettings } from '@app/game';
import { applyNotchMode } from '@drizztdourden08/brock-react';
import type { LoadedProfile, LoadedProfileTargets } from '../GameSession.type';

const applyLoadedProfile = (data: LoadedProfile, targets: LoadedProfileTargets): void => {
  const { game, display, saveState } = targets;
  primeLiveSettings(data.settings);
  applyNotchMode(data.settings.renderIntoNotch);
  game.setGameData(data.assetData, data.configIni);
  display.initFromSettings({
    windowMode: data.settings.windowMode,
    viewportConstraint: data.settings.viewportConstraint,
    aspectRatio: data.settings.aspectRatio,
    displayPerfInTitle: data.settings.displayPerfInTitle,
    overworldEdgeEffect: data.settings.overworldEdgeEffect,
    postProcessingShadows: data.settings.postProcessingShadows,
    startFullscreen: data.settings.startFullscreen,
    pixelPerfect: data.settings.pixelPerfect,
  });
  saveState.initFromSettings(data.settings.enhancedSaveSlotShortcut, data.settings.saveHoldDuration);
};

export { applyLoadedProfile };
