/* @layer shared-store @kind logic */
import { hasSignature } from './has-signature';
import { u16 } from './u16';
import { EXTRA_LENGTH_AT, HEADER_BYTES, NAME_LENGTH_AT } from './zip-local-header.constants';

const localDataOffset = (head: Uint8Array): number | null => {
  if (head.length < HEADER_BYTES || !hasSignature(head)) return null;
  return HEADER_BYTES + u16(head, NAME_LENGTH_AT) + u16(head, EXTRA_LENGTH_AT);
};

export { localDataOffset };
