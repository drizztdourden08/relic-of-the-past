/* @layer bridge-wasm @kind types */
import type { GameSettings } from '@shared/types/settings';

type LiveSettingsState = {
  hideSpaceBeyondWalls: boolean;
  vsync: boolean;
  extraDungeon: boolean;
  hudHidden: boolean;
  pauseHidden: boolean;
  masterVolume: number;
  musicVol: number;
  ambientVol: number;
  sfxVol: number;
  settings: GameSettings | null;
};

type LiveHides = {
  hideSpaceBeyondWalls: boolean;
  hudHidden: boolean;
  pauseHidden: boolean;
};

export type { LiveHides, LiveSettingsState };
