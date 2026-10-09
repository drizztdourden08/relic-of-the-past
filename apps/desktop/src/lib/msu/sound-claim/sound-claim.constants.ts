/* @layer renderer-lib @kind constants */
import type { SoundChannel } from '@rotp/game-data';
import type { SoundClaim } from './sound-claim.type';

const SOUND_CHANNELS: readonly SoundChannel[] = ['ambient', 'sfx1', 'sfx2'];

const CLAIM_BITS = 64;

const CLAIM_HALF_BITS = 32;

const EMPTY_SOUND_CLAIM: SoundClaim = { low: 0, high: 0 };

export { SOUND_CHANNELS, CLAIM_BITS, CLAIM_HALF_BITS, EMPTY_SOUND_CLAIM };
