/* @layer tests @kind helper */
import { createHash } from 'node:crypto';
import { DIGEST_LENGTH } from './rule-parity-harness.constants';

const spellOutCollections = (_key: string, value: unknown): unknown => {
  if (value instanceof Map) return [...value.entries()];
  if (value instanceof Set) return [...value.values()];
  return value;
};

const placementDigest = (placement: unknown): string => createHash('sha256')
  .update(JSON.stringify(placement, spellOutCollections))
  .digest('hex')
  .slice(0, DIGEST_LENGTH);

export { placementDigest };
