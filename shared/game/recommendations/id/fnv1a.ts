/* @layer shared-game @kind logic */
import { FNV1A_OFFSET_BASIS, FNV1A_PRIME } from './id.constants';

const fnv1a = (input: string): string => {
  let hash = FNV1A_OFFSET_BASIS;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV1A_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

export { fnv1a };
