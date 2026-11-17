/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../rom/rom-types';
import { HEADER_BYTES, LENGTH_MASK, MEMSET_FLAG, MEMSET_PAYLOAD_BYTES, STRIPE_END } from './read-stripe-table.constants';

const readStripeTable = (rom: RomData, start: number): Buffer => {
  let at = start;
  while (!(rom.getByte(at) & STRIPE_END)) {
    const isMemset = rom.getByte(at + 2) & MEMSET_FLAG;
    const length = ((rom.getByte(at + 2) * 256 + rom.getByte(at + 3)) & LENGTH_MASK) + 1;
    at += HEADER_BYTES + (isMemset ? MEMSET_PAYLOAD_BYTES : length);
  }
  return rom.getBytes(start, at - start + 1);
};

export { readStripeTable };
