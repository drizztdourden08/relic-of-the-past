/* @layer bridge-wasm @kind logic */
import { setDeluxeEntrances } from '@rotp/game-core';
import { setExternalMusic } from '@rotp/game-core';
import { restoreCoreMusic } from '@rotp/game-core';
import { withdrawSoundClaims } from '../msu-sound-claims';
import { clearPoll } from './clear-poll';
import { msuSessionState } from './msu-session-state';

const stopMsuSession = (): void => {
  clearPoll();
  msuSessionState.pending = null;
  if (!msuSessionState.engine) return;
  msuSessionState.engine.dispose();
  msuSessionState.engine = null;
  window.__onMusicCtrl = undefined;
  window.__onGameSound = undefined;
  window.__msuIsPlaying = undefined;
  restoreCoreMusic();
  setExternalMusic(false);
  setDeluxeEntrances(false);
  withdrawSoundClaims();
};

export { stopMsuSession };
