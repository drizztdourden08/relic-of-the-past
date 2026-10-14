/* @layer renderer-lib @kind logic */
import { MANIFEST_PATH } from '../save-files.constants';
import type { ManifestFile } from '../save-files.type';

const manifestFileOf = (path: string): ManifestFile | null => {
  const match = MANIFEST_PATH.exec(path);
  const dir = match?.[1];
  const kind = match?.[2];
  if (dir === undefined || (kind !== 'normal' && kind !== 'auto')) return null;
  return { dir, kind };
};

export { manifestFileOf };
