/* @layer shared-storage @kind logic */
import type { FileStore } from '@shared/platform';
import { containerExtension } from './container-extension';
import { safeFileName } from './safe-file-name';
import { spritePath } from './sprite-path';
import { spriteStem } from './sprite-stem';

const freeSpriteName = async (files: FileStore, name: string): Promise<string> => {
  const safe = safeFileName(name);
  if (!(await files.exists(spritePath(safe)))) return safe;
  const ext = containerExtension(safe);
  const stem = spriteStem(safe);
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${stem}-${n}.${ext}`;
    if (!(await files.exists(spritePath(candidate)))) return candidate;
  }
  return `${stem}-${Date.now()}.${ext}`;
};

export { freeSpriteName };
