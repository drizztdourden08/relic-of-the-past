/* @layer bridge-wasm @kind logic */
import type { SoundChannel } from '@rotp/game-data';
import { SOUND_CHANNELS } from '@app/lib/msu/sound-claim';
import type { SoundClaim } from '@app/lib/msu/sound-claim';
import { voidCall } from '@rotp/game-core';

const setSoundClaim = (channel: SoundChannel, claim: SoundClaim): void => {
  voidCall('WasmSetSoundClaim', {
    argTypes: ['number', 'number', 'number'],
    args: [SOUND_CHANNELS.indexOf(channel), claim.low, claim.high],
  });
};

export { setSoundClaim };
