/* @layer shared-asset-extraction @kind logic */
import { MAX_DIFF_HINTS } from './stream.constants';

const diffHints = (patched: Uint8Array, base: Uint8Array | null): number[] => {
  if (!base) return [];
  const hints: number[] = [];
  const shared = Math.min(patched.length, base.length);
  let same = true;
  for (let i = 0; i < shared && hints.length < MAX_DIFF_HINTS; i += 1) {
    const differs = patched[i] !== base[i];
    if (differs && same) hints.push(i);
    same = !differs;
  }
  if (patched.length > base.length && hints.length < MAX_DIFF_HINTS) hints.push(base.length);
  return hints;
};

export { diffHints };
