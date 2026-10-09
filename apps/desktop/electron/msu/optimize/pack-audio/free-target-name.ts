/* @layer electron-main @kind logic */
import { OPTIMIZE_TARGET_EXTENSION } from '@rotp/msu';
import { stemOf } from './stem-of';

const freeTargetName = (name: string, taken: Set<string>): string => {
  const stem = stemOf(name);
  const plain = `${stem}.${OPTIMIZE_TARGET_EXTENSION}`;
  if (!taken.has(plain)) return plain;
  let suffix = 2;
  while (taken.has(`${stem}-${suffix}.${OPTIMIZE_TARGET_EXTENSION}`)) suffix += 1;
  return `${stem}-${suffix}.${OPTIMIZE_TARGET_EXTENSION}`;
};

export { freeTargetName };
