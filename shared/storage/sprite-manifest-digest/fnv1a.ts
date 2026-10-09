/* @layer shared-storage @kind logic */
import { FNV1A_OFFSET_BASIS, FNV1A_PRIME } from './sprite-manifest-digest.constants';

const fnv1a = (text: string): string => {
  let hash = FNV1A_OFFSET_BASIS;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, FNV1A_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

export { fnv1a };
