/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { setDir } from '../paths';
import { SET_ID_RE } from './set-id.constants';
import { slugSetId } from './slug-set-id';

const pickFreeSetId = async (files: FileStore, wanted: string): Promise<string> => {
  const base = SET_ID_RE.test(wanted) ? wanted : slugSetId(wanted);
  if (!(await files.exists(setDir(base)))) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}-${n}`;
    if (!(await files.exists(setDir(candidate)))) return candidate;
  }
  return `${base}-${Date.now()}`;
};

export { pickFreeSetId };
