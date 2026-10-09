/* @layer shared-storage @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { missing } from './missing';
import { readStampVersion } from './read-stamp-version';

const isStale = async (
  files: FileStore, romFile: string, expected: readonly string[], expectedVersion: string,
): Promise<boolean> => {
  const absent = await missing(files, romFile, expected);
  if (absent.length === expected.length) return false;
  if (absent.length > 0) return true;
  return (await readStampVersion(files, romFile)) !== expectedVersion;
};

export { isStale };
