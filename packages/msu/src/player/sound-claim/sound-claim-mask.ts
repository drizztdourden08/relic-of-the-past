/* @layer renderer-lib @kind logic */
import type { SoundClaim } from './sound-claim.type';
import { CLAIM_HALF_BITS } from './sound-claim.constants';
import { claimableIds } from './claimable-ids';

const asUint32 = (value: number): number => value >>> 0;

const soundClaimMask = (ids: Iterable<number>): SoundClaim => {
  let low = 0;
  let high = 0;
  for (const id of claimableIds(ids)) {
    if (id < CLAIM_HALF_BITS) low |= 1 << id;
    else high |= 1 << (id - CLAIM_HALF_BITS);
  }
  return { low: asUint32(low), high: asUint32(high) };
};

export { soundClaimMask };
