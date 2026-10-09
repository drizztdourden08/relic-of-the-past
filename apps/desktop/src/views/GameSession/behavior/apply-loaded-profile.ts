/* @layer renderer-app @kind logic */
import { primeLiveSettings } from '@app/lib/game';
import { applyNotchMode } from '@drizztdourden08/brock-react';
import type { LoadedProfile, LoadedProfileTargets } from '../GameSession.type';

const applyLoadedProfile = (data: LoadedProfile, targets: LoadedProfileTargets): void => {
  const { game, display, audio, saveState } = targets;
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
  audio.initFromSettings(data.settings.masterVolume);
  saveState.initFromSettings(data.settings.enhancedSaveSlotShortcut, data.settings.saveHoldDuration);
};

export { applyLoadedProfile };
