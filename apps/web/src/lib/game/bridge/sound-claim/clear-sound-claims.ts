/* @layer bridge-wasm @kind logic */
import { EMPTY_SOUND_CLAIM, SOUND_CHANNELS } from '@app/lib/msu/sound-claim';
import { setSoundClaim } from './set-sound-claim';

const clearSoundClaims = (): void => {
  for (const channel of SOUND_CHANNELS) setSoundClaim(channel, EMPTY_SOUND_CLAIM);
};

export { clearSoundClaims };
