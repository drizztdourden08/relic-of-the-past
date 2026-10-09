/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { quickDir } from '../../save-paths';

const listStates = async (files: FileStore, p: string): Promise<number[]> => {
  const names = await files.list(quickDir(p));
  return names.filter((n) => /^save\d+\.sav$/.test(n))
    .map((n) => parseInt(n.match(/^save(\d+)\.sav$/)![1], 10))
    .sort((a, b) => a - b);
};

export { listStates };
