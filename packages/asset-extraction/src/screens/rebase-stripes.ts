/* @layer shared-asset-extraction @kind logic */
import { HEADER_BYTES, LENGTH_MASK, MEMSET_FLAG, MEMSET_PAYLOAD_BYTES, STRIPE_END } from './read-stripe-table.constants';
import { BYTE_BITS, BYTE_MASK } from './rebase-stripes.constants';
import type { TilemapRebase } from './screen-payload.type';

const wordAt = (bytes: Uint8Array, at: number): number => ((bytes[at] ?? 0) << BYTE_BITS) | (bytes[at + 1] ?? 0);

const isStripeAt = (bytes: Uint8Array, at: number): boolean =>
  at + HEADER_BYTES <= bytes.length && !((bytes[at] ?? STRIPE_END) & STRIPE_END);

const stripeBytes = (bytes: Uint8Array, at: number): number => {
  const isMemset = (bytes[at + 2] ?? 0) & MEMSET_FLAG;
  return HEADER_BYTES + (isMemset ? MEMSET_PAYLOAD_BYTES : (wordAt(bytes, at + 2) & LENGTH_MASK) + 1);
};

const moveAddress = (bytes: Uint8Array, at: number, rebase: TilemapRebase): void => {
  const address = wordAt(bytes, at);
  if (address < rebase.from) return;
  const moved = address - rebase.from + rebase.to;
  bytes[at] = (moved >> BYTE_BITS) & BYTE_MASK;
  bytes[at + 1] = moved & BYTE_MASK;
};

const rebaseStripes = (bytes: Uint8Array, rebase: TilemapRebase | undefined): Uint8Array => {
  const out = Uint8Array.from(bytes);
  if (!rebase) return out;
  for (let at = 0; isStripeAt(out, at); at += stripeBytes(out, at)) moveAddress(out, at, rebase);
  return out;
};

export { rebaseStripes };
