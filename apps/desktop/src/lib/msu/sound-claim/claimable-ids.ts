/* @layer renderer-lib @kind logic */
import { CLAIM_BITS } from './sound-claim.constants';

const claimableIds = (ids: Iterable<number>): number[] =>
  [...ids].filter((id) => Number.isInteger(id) && id >= 0 && id < CLAIM_BITS);

export { claimableIds };
