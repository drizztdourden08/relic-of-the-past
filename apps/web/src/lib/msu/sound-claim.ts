/* @layer renderer-lib @kind logic */
/**
 * Which sound ids a pack claims on a channel, as the 64-bit mask the core wants.
 *
 * The core only reports a sound whose bit is set, so this mask is the difference between "the
 * app replaces this effect" and "the sound chip plays it as it always did". It travels as two
 * unsigned 32-bit halves because that is what a `ccall` can carry.
 */
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';

/** The channels a pack can claim on, in the index order the core reports them by. */
const SOUND_CHANNELS: readonly SoundChannel[] = ['ambient', 'sfx1', 'sfx2'];

/** Width of the claim mask. The game's own ids fit well inside it. */
const CLAIM_BITS = 64;

interface SoundClaim {
  low: number;
  high: number;
}

const EMPTY_SOUND_CLAIM: SoundClaim = { low: 0, high: 0 };

/**
 * The ids a claim can actually carry. Anything outside 0..63 is dropped rather than wrapped —
 * a typo'd id must claim nothing, not silently claim some unrelated sound.
 */
const claimableIds = (ids: Iterable<number>): number[] =>
  [...ids].filter((id) => Number.isInteger(id) && id >= 0 && id < CLAIM_BITS);

const soundClaimMask = (ids: Iterable<number>): SoundClaim => {
  let low = 0;
  let high = 0;
  for (const id of claimableIds(ids)) {
    if (id < 32) low |= 1 << id;
    else high |= 1 << (id - 32);
  }
  // Bit 31 makes a signed int negative in JS; the core reads these as uint32.
  return { low: low >>> 0, high: high >>> 0 };
};

/** The ids this manifest actually authors on a channel — the honest basis for its claim. */
const manifestSoundIds = (manifest: MsuPackManifest, channel: SoundChannel): number[] =>
  claimableIds((manifest.sounds?.[channel] ?? [])
    .filter((sound) => sound.layers.length > 0)
    .map((sound) => sound.soundId));

export { SOUND_CHANNELS, CLAIM_BITS, EMPTY_SOUND_CLAIM, claimableIds, soundClaimMask, manifestSoundIds };
export type { SoundClaim };
