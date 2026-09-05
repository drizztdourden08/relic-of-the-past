/* @layer bridge-wasm @kind logic */
/**
 * Tells the core which sound ids the app has taken over, per channel.
 *
 * The gate bits (host-gates.ts) say "the host handles this channel"; these masks say WHICH ids
 * on it. Both are needed: without a mask an armed gate claims nothing, and without the gate a
 * mask is never consulted.
 */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { EMPTY_SOUND_CLAIM, SOUND_CHANNELS } from '@app/lib/msu/sound-claim';
import type { SoundClaim } from '@app/lib/msu/sound-claim';
import { voidCall } from './wasm-call';

/**
 * Publish one channel's mask. `voidCall` swallows a missing export, so an older core that has
 * no WasmSetSoundClaim yet never claims anything instead of taking the renderer down.
 */
const setSoundClaim = (channel: SoundChannel, claim: SoundClaim): void => {
  voidCall('WasmSetSoundClaim', {
    argTypes: ['number', 'number', 'number'],
    args: [SOUND_CHANNELS.indexOf(channel), claim.low, claim.high],
  });
};

/** Claim nothing on any channel. This is the state a session must leave the core in. */
const clearSoundClaims = (): void => {
  for (const channel of SOUND_CHANNELS) setSoundClaim(channel, EMPTY_SOUND_CLAIM);
};

export { setSoundClaim, clearSoundClaims };
