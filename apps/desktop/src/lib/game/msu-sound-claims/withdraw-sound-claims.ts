/* @layer bridge-wasm @kind logic */
import { setExternalAmbient, setExternalSfx } from '@rotp/game-core';
import { clearSoundClaims } from '../bridge/sound-claim';

const withdrawSoundClaims = (): void => {
  setExternalAmbient(false);
  setExternalSfx(false);
  clearSoundClaims();
};

export { withdrawSoundClaims };
